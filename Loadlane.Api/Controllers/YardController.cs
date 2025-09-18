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
        // Hole alle Fahrzeuge die sich aktuell im Yard befinden (also gedockt sind)
        // Ein Fahrzeug ist gedockt, wenn es eine Docking-Instanz mit ArrivalTime aber ohne DepartureTime hat und Mappe es zu einer Liste von DockingDto
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
}
    