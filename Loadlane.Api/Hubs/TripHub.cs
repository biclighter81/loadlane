using System.Collections.Concurrent;
using System.Text.Json;
using Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace Loadlane.Api.Hubs;

public class TripHub : Hub
{
    private readonly DirectionsService _directions;
    private readonly RouteSampler _sampler;
    private readonly IHubContext<TripHub> _hubContext;
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _runs = new();

    public TripHub(DirectionsService directions, RouteSampler sampler, IHubContext<TripHub> hubContext)
    {
        _directions = directions;
        _sampler = sampler;
        _hubContext = hubContext;
    }

    // Client calls this to start a simulated trip
    public async Task StartTrip(double aLng, double aLat, double bLng, double bLat, double speedMps = 13.9 /* ~50 km/h */)
    {
        // Stop any previous run for this connection
        await StopTrip();

        var route = await _directions.GetOrCreateRouteAsync((aLng, aLat), (bLng, bLat));
        var samples = _sampler.Resample(route.Coords, stepMeters: Math.Max(10, speedMps * 0.5)); // ~0.5s between points

        // send the route once
        await Clients.Caller.SendAsync("Route", new
        {
            distance = route.DistanceMeters,
            duration = route.DurationSeconds,
            coordinates = samples.Select(p => new[] { p.lng, p.lat }).ToArray()
        });

        var cts = new CancellationTokenSource();
        _runs[Context.ConnectionId] = cts;

        // Capture the connection ID and client reference before the background task
        var connectionId = Context.ConnectionId;

        // stream points at fixed tick
        var tick = TimeSpan.FromMilliseconds(500); // 2 Hz updates; change as needed
        _ = Task.Run(async () =>
        {
            try
            {
                int i = 0;
                while (!cts.IsCancellationRequested && i < samples.Count)
                {
                    var p = samples[i++];
                    await _hubContext.Clients.Client(connectionId).SendAsync("Position", new { lng = p.lng, lat = p.lat });
                    await Task.Delay(tick, cts.Token);
                }
                await _hubContext.Clients.Client(connectionId).SendAsync("TripCompleted");
            }
            catch (TaskCanceledException) { /* ignore */ }
            catch (Exception ex)
            {
                // Log the exception if needed, connection might have been closed
                Console.WriteLine($"Trip streaming error for {connectionId}: {ex.Message}");
            }
        }, cts.Token);
    }

    // Client calls this to start a simulated trip with waypoints
    public async Task StartTripWithWaypoints(double startLng, double startLat, double destLng, double destLat,
        IEnumerable<dynamic> waypoints, double speedMps = 13.9 /* ~50 km/h */)
    {
        // Stop any previous run for this connection
        await StopTrip();

        // Convert waypoints from dynamic objects to tuples
        var waypointCoords = waypoints.Select(w =>
        {
            if (w is JsonElement jsonElement)
            {
                var lng = jsonElement.GetProperty("lng").GetDouble();
                var lat = jsonElement.GetProperty("lat").GetDouble();
                return (lng, lat);
            }
            else
            {
                // Fallback for other dynamic types
                var dict = (IDictionary<string, object>)w;
                var lng = Convert.ToDouble(dict["lng"]);
                var lat = Convert.ToDouble(dict["lat"]);
                return (lng, lat);
            }
        }).ToList();

        var route = await _directions.GetOrCreateRouteWithWaypointsAsync(
            (startLng, startLat), (destLng, destLat), waypointCoords);
        var samples = _sampler.Resample(route.Coords, stepMeters: Math.Max(10, speedMps * 0.5)); // ~0.5s between points

        // send the route once
        await Clients.Caller.SendAsync("Route", new
        {
            distance = route.DistanceMeters,
            duration = route.DurationSeconds,
            coordinates = samples.Select(p => new[] { p.lng, p.lat }).ToArray()
        });

        var cts = new CancellationTokenSource();
        _runs[Context.ConnectionId] = cts;

        // Capture the connection ID and client reference before the background task
        var connectionId = Context.ConnectionId;

        // stream points at fixed tick
        var tick = TimeSpan.FromMilliseconds(500); // 2 Hz updates; change as needed
        _ = Task.Run(async () =>
        {
            try
            {
                int i = 0;
                while (!cts.IsCancellationRequested && i < samples.Count)
                {
                    var p = samples[i++];
                    await _hubContext.Clients.Client(connectionId).SendAsync("Position", new { lng = p.lng, lat = p.lat });
                    await Task.Delay(tick, cts.Token);
                }
                await _hubContext.Clients.Client(connectionId).SendAsync("TripCompleted");
            }
            catch (TaskCanceledException) { /* ignore */ }
            catch (Exception ex)
            {
                // Log the exception if needed, connection might have been closed
                Console.WriteLine($"Trip streaming error for {connectionId}: {ex.Message}");
            }
        }, cts.Token);
    }

    public Task StopTrip()
    {
        if (_runs.TryRemove(Context.ConnectionId, out var cts))
            cts.Cancel();
        return Task.CompletedTask;
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _ = StopTrip();
        return base.OnDisconnectedAsync(exception);
    }
}