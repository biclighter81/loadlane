using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/yard")]
public class YardController : ControllerBase
{

    [HttpGet]
    public async Task<IActionResult> GetDockedVehicles(CancellationToken cancellationToken)
    {

        //return dummy data for now (DockingDto with random Vehicle)
        var dummyData = new List<DockingDto>
        {
            new DockingDto(
                new VehicleDto("1", "ABC123", "Carrier A", "Driver A", "123456789"),
                new GatesDto("1", 1, true, "Type A", "Description A"),
                DateTime.UtcNow.AddHours(-1),
                null
            ),
            new DockingDto(
                new VehicleDto("2", "DEF456", "Carrier B", "Driver B", "987654321"),
                new GatesDto("2", 2, true, "Type B", "Description B"),
                DateTime.UtcNow.AddHours(-2),
                DateTime.UtcNow.AddMinutes(-30)
            )
        };
        var result = await Task.FromResult(dummyData);
        return Ok(result);
    }
}