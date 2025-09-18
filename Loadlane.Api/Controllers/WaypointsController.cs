using Loadlane.Application.DTOs;
using Loadlane.Application.Services.Waypoints;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WaypointsController : ControllerBase
{
    private readonly IWaypointService _waypointService;

    public WaypointsController(IWaypointService waypointService)
    {
        _waypointService = waypointService;
    }

    /// <summary>
    /// Gets all waypoints for a specific transport
    /// </summary>
    /// <param name="transportId">The transport ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of waypoints for the transport</returns>
    [HttpGet("transport/{transportId:guid}")]
    public async Task<ActionResult<List<WaypointResponseDto>>> GetByTransportId(
        Guid transportId, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var waypoints = await _waypointService.GetWaypointsByTransportIdAsync(transportId, cancellationToken);
            return Ok(waypoints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching waypoints.", error = ex.Message });
        }
    }

    /// <summary>
    /// Updates a waypoint with actual arrival time and/or gate assignment
    /// </summary>
    /// <param name="waypointId">The waypoint ID</param>
    /// <param name="updateDto">The update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success status</returns>
    [HttpPut("{waypointId:guid}")]
    public async Task<IActionResult> UpdateWaypoint(
        Guid waypointId,
        [FromBody] UpdateWaypointDto updateDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _waypointService.UpdateWaypointAsync(waypointId, updateDto, cancellationToken);

            if (!success)
            {
                return NotFound(new { message = $"Waypoint with ID {waypointId} not found" });
            }

            return Ok(new { message = "Waypoint updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating waypoint.", error = ex.Message });
        }
    }
}