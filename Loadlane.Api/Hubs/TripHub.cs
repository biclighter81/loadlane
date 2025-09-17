using System.Collections.Concurrent;
using Application.Services;
using Microsoft.AspNet.SignalR;

namespace Loadlane.Api.Hubs;

public sealed class TripHub : Hub
{
    private readonly DirectionsService _directions;
    private readonly RouteSampler _sampler;
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _runs = new();

    public TripHub(DirectionsService directions, RouteSampler sampler)
    {
        _directions = directions;
        _sampler = sampler;
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
                    await Clients.Caller.SendAsync("Position", new { lng = p.lng, lat = p.lat });
                    await Task.Delay(tick, cts.Token);
                }
                await Clients.Caller.SendAsync("TripCompleted");
            }
            catch (TaskCanceledException) { /* ignore */ }
        }, cts.Token);
    }

    public Task StopTrip()
    {
        if (_runs.TryRemove(Context.ConnectionId, out var cts))
            cts.Cancel();
        return Task.CompletedTask;
    }

    public override Task OnDisconnected(bool stopCalled)
    {
        return base.OnDisconnected(stopCalled);
    }
}