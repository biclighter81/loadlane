using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/warehouses")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    #region Warehouse Endpoints

    [HttpPost]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createWarehouseDto = new CreateWarehouseDto(
                request.Organisation,
                request.Name,
                request.Location,
                request.Gates);

            var result = await _warehouseService.CreateWarehouseAsync(createWarehouseDto, cancellationToken);

            return CreatedAtAction(nameof(GetWarehouse), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the warehouse.", details = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetWarehouse(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var warehouse = await _warehouseService.GetWarehouseByIdAsync(id, cancellationToken);

            if (warehouse == null)
            {
                return NotFound(new { error = $"Warehouse with ID {id} not found." });
            }

            return Ok(warehouse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving the warehouse.", details = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetWarehouses(CancellationToken cancellationToken)
    {
        try
        {
            var warehouses = await _warehouseService.GetAllWarehousesAsync(cancellationToken);
            return Ok(warehouses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving warehouses.", details = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateWarehouse(Guid id, [FromBody] UpdateWarehouseRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updateWarehouseDto = new UpdateWarehouseDto(
                request.Organisation,
                request.Name,
                request.Location);

            var result = await _warehouseService.UpdateWarehouseAsync(id, updateWarehouseDto, cancellationToken);

            if (result == null)
            {
                return NotFound(new { error = $"Warehouse with ID {id} not found." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while updating the warehouse.", details = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWarehouse(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _warehouseService.DeleteWarehouseAsync(id, cancellationToken);

            if (!result)
            {
                return NotFound(new { error = $"Warehouse with ID {id} not found." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the warehouse.", details = ex.Message });
        }
    }

    #endregion

    #region Gate Endpoints

    [HttpPost("{warehouseId:guid}/gates")]
    public async Task<IActionResult> CreateGate(Guid warehouseId, [FromBody] CreateGateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createGateDto = new CreateGateDto(
                request.Number,
                request.Description);

            var result = await _warehouseService.CreateGateAsync(warehouseId, createGateDto, cancellationToken);

            return CreatedAtAction(nameof(GetGate), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the gate.", details = ex.Message });
        }
    }

    [HttpGet("gates/{id:guid}")]
    public async Task<IActionResult> GetGate(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var gate = await _warehouseService.GetGateByIdAsync(id, cancellationToken);

            if (gate == null)
            {
                return NotFound(new { error = $"Gate with ID {id} not found." });
            }

            return Ok(gate);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving the gate.", details = ex.Message });
        }
    }

    [HttpGet("{warehouseId:guid}/gates")]
    public async Task<IActionResult> GetWarehouseGates(Guid warehouseId, CancellationToken cancellationToken)
    {
        try
        {
            var gates = await _warehouseService.GetGatesByWarehouseIdAsync(warehouseId, cancellationToken);
            return Ok(gates);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving gates.", details = ex.Message });
        }
    }

    [HttpPut("gates/{id:guid}")]
    public async Task<IActionResult> UpdateGate(Guid id, [FromBody] UpdateGateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updateGateDto = new UpdateGateDto(
                request.Number,
                request.Description,
                request.IsActive);

            var result = await _warehouseService.UpdateGateAsync(id, updateGateDto, cancellationToken);

            if (result == null)
            {
                return NotFound(new { error = $"Gate with ID {id} not found." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while updating the gate.", details = ex.Message });
        }
    }

    [HttpDelete("gates/{id:guid}")]
    public async Task<IActionResult> DeleteGate(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _warehouseService.DeleteGateAsync(id, cancellationToken);

            if (!result)
            {
                return NotFound(new { error = $"Gate with ID {id} not found." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the gate.", details = ex.Message });
        }
    }

    #endregion
}

#region Request Records

public sealed record CreateWarehouseRequest(
    string Organisation,
    string Name,
    LocationDto Location,
    List<CreateGateDto>? Gates = null
);

public sealed record UpdateWarehouseRequest(
    string Organisation,
    string Name,
    LocationDto Location
);

public sealed record CreateGateRequest(
    int Number,
    string? Description = null
);

public sealed record UpdateGateRequest(
    int Number,
    string? Description = null,
    bool IsActive = true
);

#endregion