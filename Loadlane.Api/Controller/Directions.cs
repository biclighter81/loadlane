namespace Api.Controller;

using Application.Logging;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/directions")]
public class DirectionsController : ControllerBase
{
    private readonly DirectionsService _directionsService;
    private readonly RouteSampler _routeSampler;

    public DirectionsController(ILoggerManager logger, DirectionsService directionsService, RouteSampler routeSampler)
    {
        _directionsService = directionsService;
        _routeSampler = routeSampler;
    }

    [HttpGet("route")]
    public async Task<IActionResult> GetRoute(
        [FromQuery] double aLng,
        [FromQuery] double aLat,
        [FromQuery] double bLng,
        [FromQuery] double bLat,
        [FromQuery] double? stepMeters = null)
    {
        var route = await _directionsService.GetOrCreateRouteAsync((aLng, aLat), (bLng, bLat));
        var samples = stepMeters.HasValue
            ? _routeSampler.Resample(route.Coords, stepMeters.Value)
            : route.Coords;
        return Ok(new
        {
            distance = route.DistanceMeters,
            duration = route.DurationSeconds,
            coordinates = samples.Select(p => new[] { p.lng, p.lat }).ToArray()
        });
    }
}