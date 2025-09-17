using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text.Json;
using Application.Services;
using Loadlane.Application.Services;
using Loadlane.Application.DTOs;
using Microsoft.AspNetCore.SignalR;
using AppRoute = Application.Records.Route;

namespace Loadlane.Api.Hubs;

public class TripHub : Hub
{
    private readonly DirectionsService _directions;
    private readonly IOrderService _orderService;
    private readonly RouteSampler _sampler;
    private readonly SimStateStore _simStateStore;
    private readonly IHubContext<TripHub> _hubContext;

    // Track running simulations by transportId
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _activeSimulations = new();

    // Groups for transport-specific broadcasts
    private readonly IGroupManager _groups;

    public TripHub(DirectionsService directions, IOrderService orderService, RouteSampler sampler,
                   SimStateStore simStateStore, IHubContext<TripHub> hubContext)
    {
        _directions = directions;
        _orderService = orderService;
        _sampler = sampler;
        _simStateStore = simStateStore;
        _hubContext = hubContext;
        _groups = _hubContext.Groups;
    }

    public async Task SubscribeToOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();

        foreach (var order in orders)
        {
            if (order.Transport.StartLocation == null || order.Transport.DestinationLocation == null ||
                string.IsNullOrEmpty(order.DirectionsCacheKey))
                continue;

            // Add client to transport-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"transport:{order.Transport.TransportId}");

            // Send Transport event to client
            await Clients.Caller.SendAsync("Transport", new
            {
                orderId = order.Id,
                transportId = order.Transport.TransportId,
                status = order.Transport.Status.ToString(),
                carrier = order.Transport.Carrier?.Name,
                startLocation = order.Transport.StartLocation,
                destinationLocation = order.Transport.DestinationLocation,
                stopps = order.Transport.Stopps
            });

            // Start position simulation for this transport (default speed: 15 m/s ≈ 54 km/h)
            _ = Task.Run(() => SimulateTransportPositions(
                order.Transport.TransportId,
                order.DirectionsCacheKey,
                speedMps: 150.0), CancellationToken.None);
        }
    }

    /// <summary>
    /// Starts or resumes time-based transport simulation with Redis persistence
    /// </summary>
    /// <param name="transportId">Unique transport identifier</param>
    /// <param name="routeCacheKey">Cache key for the route data</param>
    /// <param name="speedMps">Speed in meters per second (default: 15 m/s)</param>
    public async Task SimulateTransportPositions(string transportId, string routeCacheKey, double speedMps = 15.0)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        if (string.IsNullOrEmpty(routeCacheKey))
            throw new ArgumentException("RouteCacheKey cannot be null or empty", nameof(routeCacheKey));

        try
        {
            // Cancel existing simulation for this transport
            if (_activeSimulations.TryRemove(transportId, out var existingCts))
            {
                existingCts.Cancel();
                existingCts.Dispose();
            }

            // Create new cancellation token for this simulation
            var cts = new CancellationTokenSource();
            _activeSimulations.TryAdd(transportId, cts);
            var cancellationToken = cts.Token;

            // Get route from cache
            var route = await _directions.GetCachedRouteAsync(routeCacheKey, cancellationToken);
            if (route == null)
            {
                await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("SimulationError", new
                {
                    transportId,
                    message = $"Route not found in cache: {routeCacheKey}"
                }, cancellationToken);
                return;
            }

            // Resample route to ~20m steps for smooth interpolation
            var resampledCoords = _sampler.Resample(route.Coords, stepMeters: 20);
            var runner = new PolylineRunner(resampledCoords);

            // Load or initialize simulation state
            var savedState = await _simStateStore.GetAsync(transportId);
            double startMetersAlong = 0.0;
            double currentSpeedMps = speedMps;

            if (savedState != null && savedState.RouteKey == routeCacheKey)
            {
                // Resume from saved state, accounting for time elapsed
                var elapsedTime = DateTimeOffset.UtcNow - savedState.UpdatedUtc;
                var elapsedSeconds = elapsedTime.TotalSeconds;
                startMetersAlong = savedState.MetersAlong + (savedState.SpeedMps * elapsedSeconds);
                currentSpeedMps = savedState.SpeedMps;

                // Clamp to route bounds
                startMetersAlong = Math.Max(0, Math.Min(startMetersAlong, runner.TotalMeters));
            }

            // Broadcast route information once
            await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("Route", new
            {
                transportId,
                distance = route.DistanceMeters,
                duration = route.DurationSeconds,
                coordinates = route.Coords.Select(p => new[] { p.lng, p.lat }).ToArray()
            }, cancellationToken);

            // Time-based simulation loop
            const int tickMs = 100; // 10 Hz
            var stopwatch = Stopwatch.StartNew();
            double metersAlong = startMetersAlong;
            var lastPersistTime = DateTimeOffset.UtcNow;

            while (metersAlong < runner.TotalMeters && !cancellationToken.IsCancellationRequested)
            {
                var elapsedMs = stopwatch.ElapsedMilliseconds;
                stopwatch.Restart();

                // Calculate distance traveled in this tick
                var deltaTime = elapsedMs / 1000.0; // Convert to seconds
                metersAlong += currentSpeedMps * deltaTime;

                // Clamp to route end
                metersAlong = Math.Min(metersAlong, runner.TotalMeters);

                // Get current position
                var position = runner.At(metersAlong);

                // Broadcast position update
                await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("Position", new
                {
                    transportId,
                    lng = position.lng,
                    lat = position.lat
                }, cancellationToken);

                // Persist state every ~1 second
                var now = DateTimeOffset.UtcNow;
                if ((now - lastPersistTime).TotalSeconds >= 1.0)
                {
                    var state = new TransportSimState(transportId, routeCacheKey, metersAlong, currentSpeedMps, now);
                    await _simStateStore.SetAsync(state);
                    lastPersistTime = now;
                }

                // Wait for next tick
                await Task.Delay(tickMs, cancellationToken);
            }

            // Transport completed - final broadcast and cleanup
            await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("TransportCompleted", new
            {
                transportId
            }, cancellationToken);

            // Clean up simulation state
            await _simStateStore.RemoveAsync(transportId);
            _activeSimulations.TryRemove(transportId, out _);
        }
        catch (OperationCanceledException)
        {
            // Simulation was cancelled - persist final state
            Console.WriteLine($"Transport simulation cancelled for {transportId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Transport simulation error for {transportId}: {ex.Message}");
            await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("SimulationError", new
            {
                transportId,
                message = ex.Message
            });
        }
        finally
        {
            _activeSimulations.TryRemove(transportId, out var cts);
            cts?.Dispose();
        }
    }

    /// <summary>
    /// Updates the speed of an active transport simulation
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    /// <param name="speedMps">New speed in meters per second</param>
    public async Task SetTransportSpeed(string transportId, double speedMps)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        if (speedMps < 0)
            throw new ArgumentException("Speed cannot be negative", nameof(speedMps));

        try
        {
            // Update the saved state with new speed
            var updated = await _simStateStore.UpdateSpeedAsync(transportId, speedMps, DateTimeOffset.UtcNow);

            if (updated)
            {
                // Broadcast speed change to clients
                await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("TransportSpeedChanged", new
                {
                    transportId,
                    speedMps
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating transport speed for {transportId}: {ex.Message}");
        }
    }

    /// <summary>
    /// Stops simulation for a specific transport
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    public Task StopTransportSimulation(string transportId)
    {
        if (string.IsNullOrEmpty(transportId))
            return Task.CompletedTask;

        if (_activeSimulations.TryRemove(transportId, out var cts))
        {
            cts.Cancel();
            cts.Dispose();
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Stops all simulations for the current connection
    /// </summary>
    public Task StopAllSimulations()
    {
        // Note: In a real implementation, you might want to track which 
        // simulations belong to which connection for more precise cleanup
        return Task.CompletedTask;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Remove client from all transport groups they might be in
        // Note: SignalR automatically handles group cleanup on disconnect
        await base.OnDisconnectedAsync(exception);
    }
}