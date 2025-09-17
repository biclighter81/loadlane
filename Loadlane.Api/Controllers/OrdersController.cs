using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
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
    public async Task<IActionResult> GetOrders(CancellationToken cancellationToken)
    {
        try
        {
            var orders = await _orderService.GetAllOrdersAsync(cancellationToken);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving orders.", details = ex.Message });
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