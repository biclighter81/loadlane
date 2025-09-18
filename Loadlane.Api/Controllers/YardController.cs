using Application.Services;
using Loadlane.Api.Hubs;
using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Loadlane.Application.Services.Waypoints;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/yard")]
public class YardController : ControllerBase
{
    private readonly IHubContext<TripHub> _hubContext;
    private readonly IWaypointService _waypointService;
    private readonly IOrderService _orderService;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public YardController(IWaypointService waypointService, IOrderService orderService, IHubContext<TripHub> hubContext, IServiceScopeFactory serviceScopeFactory)
    {
        _hubContext = hubContext;
        _waypointService = waypointService;
        _serviceScopeFactory = serviceScopeFactory;
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDockedVehicles([FromQuery] string warehouseId, CancellationToken cancellationToken)
    {

        var dockedVehicles = await _waypointService.GetDockedVehiclesAsync(warehouseId, cancellationToken);
        if (dockedVehicles == null || !dockedVehicles.Any())
        {
            return Ok(new List<DockingDto>());
        }
        // Mappe die DockedVehicles zu einer Liste von DockingDto
        var dockingDtos = dockedVehicles.Select(dv => new DockingDto(
            new VehicleDto(dv.Id, dv.LicensePlate, dv.Carrier, dv.Driver, dv.Vin),
            new GatesDto(dv.GateId, dv.DockingPosition, dv.IsActive, dv.GateType, dv.GateDescription),
            dv.ArrivalTime,
            dv.DepartureTime
        )).ToList();

        return Ok(dockingDtos);
    }

    [HttpPut("gate-status")]
    public async Task<IActionResult> UpdateGateStatus([FromBody] UpdateGateStatusRequest request, CancellationToken cancellationToken)
    {
        // Dummy implementation for updating gate status
        // TODO: Implement actual gate status update logic

        // Simulate some processing time
        await Task.Delay(100, cancellationToken);

        // Log the request for debugging
        Console.WriteLine($"Dummy: Updating gate status for waypoint {request.WaypointId}, dock {request.DockId}, transport {request.TransportId ?? "none"}");

        // Return success response
        return Ok(new { Message = "Gate status updated successfully", WaypointId = request.WaypointId, DockId = request.DockId });
    }

    [HttpDelete("remove-vehicle")]
    public async Task<IActionResult> RemoveDockedVehicle([FromBody] RemoveVehicleRequest request, CancellationToken cancellationToken)
    {

        try
        {
            var transportId = request.TransportId;
            var success = await _orderService.ContinueTransportToNextWaypointAsync(transportId, cancellationToken);

            if (!success)
            {
                return NotFound(new { error = $"Transport '{transportId}' not found or not in waiting state" });
            }

            // Check if transport was completed or is continuing
            var orders = await _orderService.GetAllOrdersAsync();
            var order = orders.FirstOrDefault(o => o.Transport.TransportId == transportId);

            if (order?.Transport.Status == Domain.Enums.TransportStatus.Completed)
            {
                // Transport was completed - broadcast completion event
                await _hubContext.Clients.All.SendAsync("TransportCompleted", new
                {
                    transportId,
                    order = order
                }, cancellationToken);

                return Ok(new { message = $"Transport '{transportId}' completed successfully" });
            }
            else
            {
                // Transport is continuing - broadcast continuation event and restart simulation
                await _hubContext.Clients.All.SendAsync("TransportContinued", new { transportId }, cancellationToken);

                // Restart the simulation by creating a TripHub instance and calling StartWaitingTransport
                await RestartTransportSimulation(transportId, cancellationToken);

                return Ok(new { message = $"Transport '{transportId}' continued to next waypoint" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while continuing transport.", details = ex.Message });
        }
    }

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

// Request DTOs for the new endpoints
public record UpdateGateStatusRequest(string WaypointId, int DockId, string? TransportId);
public record RemoveVehicleRequest(string WaypointId, string VehicleId, string TransportId);