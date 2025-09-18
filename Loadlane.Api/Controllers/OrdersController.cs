using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Loadlane.Api.Hubs;
using Application.Services;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IHubContext<TripHub> _hubContext;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public OrdersController(IOrderService orderService, IHubContext<TripHub> hubContext, IServiceScopeFactory serviceScopeFactory)
    {
        _orderService = orderService;
        _hubContext = hubContext;
        _serviceScopeFactory = serviceScopeFactory;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createOrderDto = new CreateOrderDto(
                request.ExtOrderNo,
                request.Quantity,
                request.Article,
                request.Carrier,
                request.StartLocation,
                request.DestinationLocation,
                request.PlannedDeparture,
                request.PlannedArrival,
                request.Stopps);

            var result = await _orderService.CreateOrderAsync(createOrderDto, cancellationToken);

            return CreatedAtAction(nameof(GetOrder), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the order.", details = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);

            if (order == null)
            {
                return NotFound(new { error = $"Order with ID {id} not found." });
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving the order.", details = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] bool? includeCompleted, CancellationToken cancellationToken)
    {
        try
        {
            var orders = await _orderService.GetAllOrdersAsync(includeCompleted, cancellationToken);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving orders.", details = ex.Message });
        }
    }

    [HttpPost("transport/{transportId}/continue")]
    public async Task<IActionResult> ContinueTransport(string transportId, CancellationToken cancellationToken)
    {
        try
        {
            var success = await _orderService.ContinueTransportToNextWaypointAsync(transportId, cancellationToken);

            if (!success)
            {
                return NotFound(new { error = $"Transport '{transportId}' not found or not in waiting state" });
            }

            // Broadcast to SignalR that transport has departed and is continuing
            await _hubContext.Clients.All.SendAsync("TransportContinued", new { transportId }, cancellationToken);

            // Restart the simulation by creating a TripHub instance and calling StartWaitingTransport
            await RestartTransportSimulation(transportId, cancellationToken);

            return Ok(new { message = $"Transport '{transportId}' continued to next waypoint" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while continuing transport.", details = ex.Message });
        }
    }

    /// <summary>
    /// Restarts simulation for a transport that is continuing from a waypoint
    /// </summary>
    private async Task RestartTransportSimulation(string transportId, CancellationToken cancellationToken)
    {
        try
        {
            // Get the order to retrieve route cache key and check status
            var orders = await _orderService.GetAllOrdersAsync();
            var order = orders.FirstOrDefault(o => o.Transport.TransportId == transportId);

            if (order != null &&
                order.Transport.Status == Domain.Enums.TransportStatus.InProgress &&
                !string.IsNullOrEmpty(order.DirectionsCacheKey))
            {
                // Create a TripHub instance to call StartWaitingTransport
                using var scope = _serviceScopeFactory.CreateScope();
                var serviceProvider = scope.ServiceProvider;

                // Get all required dependencies for TripHub
                var directions = serviceProvider.GetRequiredService<DirectionsService>();
                var orderService = serviceProvider.GetRequiredService<IOrderService>();
                var sampler = serviceProvider.GetRequiredService<RouteSampler>();
                var simStateStore = serviceProvider.GetRequiredService<SimStateStore>();
                var globalSimStore = serviceProvider.GetRequiredService<GlobalSimulationStore>();
                var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();

                // Create TripHub instance and start the transport
                var tripHub = new TripHub(directions, orderService, sampler, simStateStore,
                    globalSimStore, _hubContext, serviceScopeFactory);

                await tripHub.StartWaitingTransport(transportId);

                Console.WriteLine($"Restarted simulation for continued transport: {transportId}");
            }
            else
            {
                Console.WriteLine($"Cannot restart simulation for transport {transportId}: not found, not in progress, or missing route cache key");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error restarting simulation for transport {transportId}: {ex.Message}");
        }
    }
}

public sealed record CreateOrderRequest(
    string ExtOrderNo,
    int Quantity,
    ArticleDto Article,
    CarrierDto Carrier,
    LocationDto StartLocation,
    LocationDto DestinationLocation,
    DateTime? PlannedDeparture = null,
    DateTime? PlannedArrival = null,
    List<StoppDto>? Stopps = null
);