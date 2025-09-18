using Loadlane.Application.DTOs;
using Loadlane.Application.Services.Waypoints;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/yard")]
public class YardController : ControllerBase
{
    private readonly IWaypointService _waypointService;

    public YardController(IWaypointService waypointService)
    {
        _waypointService = waypointService;
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
        // Dummy implementation for removing a docked vehicle
        // TODO: Implement actual vehicle removal logic
        
        // Simulate some processing time
        await Task.Delay(100, cancellationToken);
        
        // Log the request for debugging
        Console.WriteLine($"Dummy: Removing docked vehicle {request.VehicleId} from waypoint {request.WaypointId}");
        
        // Return success response
        return Ok(new { Message = "Vehicle removed successfully", WaypointId = request.WaypointId, VehicleId = request.VehicleId });
    }
}

// Request DTOs for the new endpoints
public record UpdateGateStatusRequest(string WaypointId, int DockId, string? TransportId);
public record RemoveVehicleRequest(string WaypointId, string VehicleId);