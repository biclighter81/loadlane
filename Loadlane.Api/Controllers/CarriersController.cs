using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/carriers")]
public class CarriersController : ControllerBase
{
    private readonly ICarrierService _carrierService;

    public CarriersController(ICarrierService carrierService)
    {
        _carrierService = carrierService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCarrier([FromBody] CreateCarrierRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createCarrierDto = new CreateCarrierDto(
                request.Name,
                request.ContactEmail,
                request.ContactPhone);

            var result = await _carrierService.CreateCarrierAsync(createCarrierDto, cancellationToken);

            return CreatedAtAction(nameof(GetCarrier), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the carrier.", details = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCarrier(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var carrier = await _carrierService.GetCarrierByIdAsync(id, cancellationToken);

            if (carrier == null)
            {
                return NotFound(new { error = "Carrier not found." });
            }

            return Ok(carrier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving the carrier.", details = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCarriers(CancellationToken cancellationToken)
    {
        try
        {
            var carriers = await _carrierService.GetAllCarriersAsync(cancellationToken);
            return Ok(carriers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving carriers.", details = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCarrier(Guid id, [FromBody] UpdateCarrierRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updateCarrierDto = new UpdateCarrierDto(
                request.Name,
                request.ContactEmail,
                request.ContactPhone);

            var result = await _carrierService.UpdateCarrierAsync(id, updateCarrierDto, cancellationToken);

            if (result == null)
            {
                return NotFound(new { error = "Carrier not found." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while updating the carrier.", details = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCarrier(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _carrierService.DeleteCarrierAsync(id, cancellationToken);

            if (!result)
            {
                return NotFound(new { error = "Carrier not found." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the carrier.", details = ex.Message });
        }
    }
}

// Request DTOs for API
public sealed record CreateCarrierRequest(
    string Name,
    string? ContactEmail = null,
    string? ContactPhone = null
);

public sealed record UpdateCarrierRequest(
    string Name,
    string? ContactEmail = null,
    string? ContactPhone = null
);