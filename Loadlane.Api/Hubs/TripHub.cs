using System.Collections.Concurrent;
using System.Diagnostics;
using Application.Services;
using Loadlane.Application.Services;
using Loadlane.Domain.Enums;
using Microsoft.AspNetCore.SignalR;

namespace Loadlane.Api.Hubs;

public class TripHub : Hub
{
    private readonly DirectionsService _directions;
    private readonly IOrderService _orderService;
    private readonly RouteSampler _sampler;
    private readonly SimStateStore _simStateStore;
    private readonly GlobalSimulationStore _globalSimStore;
    private readonly IHubContext<TripHub> _hubContext;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    // Track running simulations by transportId
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _activeSimulations = new();

    public TripHub(DirectionsService directions, IOrderService orderService, RouteSampler sampler,
                   SimStateStore simStateStore, GlobalSimulationStore globalSimStore, IHubContext<TripHub> hubContext,
                   IServiceScopeFactory serviceScopeFactory)
    {
        _directions = directions;
        _orderService = orderService;
        _sampler = sampler;
        _simStateStore = simStateStore;
        _globalSimStore = globalSimStore;
        _hubContext = hubContext;
        _serviceScopeFactory = serviceScopeFactory;
    }

    public async Task SubscribeToOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        orders = orders.Where(o => o.Transport.Status == TransportStatus.Accepted ||
                                  o.Transport.Status == TransportStatus.InProgress ||
                                  o.Transport.Status == TransportStatus.Waiting).ToList();

        foreach (var order in orders)
        {
            if (order.Transport.StartLocation == null || order.Transport.DestinationLocation == null ||
                string.IsNullOrEmpty(order.DirectionsCacheKey))
                continue;

            // Add client to transport-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"transport:{order.Transport.TransportId}");

            // Send complete Order event to client (not just transport)
            await Clients.Caller.SendAsync("Order", order);

            // Handle different transport statuses
            if (order.Transport.Status == TransportStatus.InProgress || order.Transport.Status == TransportStatus.Accepted)
            {
                // Start position simulation for this transport using global speed control
                _ = Task.Run(() => SimulateTransportPositions(
                    order.Transport.TransportId,
                    order.DirectionsCacheKey), CancellationToken.None);
            }
            else if (order.Transport.Status == TransportStatus.Waiting)
            {
                // For waiting transports, get their current position from simulation state and display them there
                _ = Task.Run(async () => await ShowWaitingTransportAtCurrentPosition(order.Transport.TransportId, order.DirectionsCacheKey));
            }
        }
    }

    /// <summary>
    /// Shows a waiting transport at its current simulation state position (where it stopped)
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    /// <param name="routeCacheKey">Cache key for the route data</param>
    private async Task ShowWaitingTransportAtCurrentPosition(string transportId, string routeCacheKey)
    {
        if (string.IsNullOrEmpty(transportId) || string.IsNullOrEmpty(routeCacheKey))
            return;

        try
        {
            // Get saved simulation state
            var savedState = await _simStateStore.GetAsync(transportId);
            if (savedState == null || savedState.RouteKey != routeCacheKey)
            {
                Console.WriteLine($"No simulation state found for waiting transport {transportId}");
                return;
            }

            // Get route from cache
            var route = await _directions.GetCachedRouteAsync(routeCacheKey);
            if (route == null)
            {
                Console.WriteLine($"Route not found in cache for waiting transport {transportId}: {routeCacheKey}");
                return;
            }

            // Calculate current position on route
            var runner = new PolylineRunner(route.Coords);
            var currentPosition = runner.At(savedState.MetersAlong);

            // Send route information
            await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("Route", new
            {
                transportId,
                distance = route.DistanceMeters,
                duration = route.DurationSeconds,
                coordinates = route.Coords.Select(p => new[] { p.lng, p.lat }).ToArray()
            });

            // Send current position where the transport is waiting
            await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("Position", new
            {
                transportId,
                lng = currentPosition.lng,
                lat = currentPosition.lat
            });

            Console.WriteLine($"Positioned waiting transport {transportId} at current state: {currentPosition.lat:F6}, {currentPosition.lng:F6} (meters: {savedState.MetersAlong:F0})");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error positioning waiting transport {transportId}: {ex.Message}");
        }
    }

    /// <summary>
    /// Starts or resumes time-based transport simulation with Redis persistence and global speed control
    /// </summary>
    /// <param name="transportId">Unique transport identifier</param>
    /// <param name="routeCacheKey">Cache key for the route data</param>
    public async Task SimulateTransportPositions(string transportId, string routeCacheKey)
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
            //var resampledCoords = _sampler.Resample(route.Coords, stepMeters: 20);
            var runner = new PolylineRunner(route.Coords);

            // Load or initialize simulation state
            var savedState = await _simStateStore.GetAsync(transportId);
            double startMetersAlong = 0.0;

            if (savedState != null && savedState.RouteKey == routeCacheKey)
            {
                // Resume from saved state, accounting for time elapsed using current global speed
                var currentSpeed = await _globalSimStore.GetCurrentSpeedAsync();
                var elapsedTime = DateTimeOffset.UtcNow - savedState.UpdatedUtc;
                var elapsedSeconds = elapsedTime.TotalSeconds;
                startMetersAlong = savedState.MetersAlong + (currentSpeed * elapsedSeconds);

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

            // Get transport waypoints for arrival detection
            List<(double lat, double lng, bool isDestination)> waypoints = new();
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                var orders = await orderService.GetAllOrdersAsync();
                var order = orders.FirstOrDefault(o => o.Transport.TransportId == transportId);

                if (order?.Transport != null)
                {
                    // Add all stopps as waypoints
                    foreach (var stopp in order.Transport.Stopps.OrderBy(s => s.SequenceNumber))
                    {
                        waypoints.Add((stopp.Location.Latitude, stopp.Location.Longitude, false));
                    }

                    // Add destination as final waypoint
                    if (order.Transport.DestinationLocation != null)
                    {
                        waypoints.Add((order.Transport.DestinationLocation.Latitude, order.Transport.DestinationLocation.Longitude, true));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading waypoints for transport {transportId}: {ex.Message}");
            }

            // Track visited waypoints
            var visitedWaypoints = new HashSet<int>();
            const double waypointToleranceMeters = 200; // 200m tolerance for waypoint detection

            // Time-based simulation loop with global speed
            const int tickMs = 100; // 10 Hz
            var stopwatch = Stopwatch.StartNew();
            double metersAlong = startMetersAlong;
            var lastPersistTime = DateTimeOffset.UtcNow;

            while (metersAlong < runner.TotalMeters && !cancellationToken.IsCancellationRequested)
            {
                var elapsedMs = stopwatch.ElapsedMilliseconds;
                stopwatch.Restart();

                // Get current global speed
                var currentSpeedMps = await _globalSimStore.GetCurrentSpeedAsync();

                // Calculate distance traveled in this tick
                var deltaTime = elapsedMs / 1000.0; // Convert to seconds
                metersAlong += currentSpeedMps * deltaTime;

                // Clamp to route end
                metersAlong = Math.Min(metersAlong, runner.TotalMeters);

                // Get current position
                var position = runner.At(metersAlong);

                // Check for waypoint arrivals
                for (int i = 0; i < waypoints.Count; i++)
                {
                    if (visitedWaypoints.Contains(i)) continue; // Already visited this waypoint

                    var waypoint = waypoints[i];
                    var distance = CalculateDistance(position.lat, position.lng, waypoint.lat, waypoint.lng);

                    if (distance <= waypointToleranceMeters)
                    {
                        visitedWaypoints.Add(i);

                        // Send arrival event for this waypoint
                        await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("TransportArrived", new
                        {
                            transportId,
                            isIntermediateWaypoint = !waypoint.isDestination,
                            waypointIndex = i,
                            lat = waypoint.lat,
                            lng = waypoint.lng
                        }, cancellationToken);

                        // Handle arrival logic for this waypoint
                        try
                        {
                            using var scope = _serviceScopeFactory.CreateScope();
                            var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                            await orderService.HandleTransportArrivalAsync(transportId, waypoint.lat, waypoint.lng, cancellationToken);
                            Console.WriteLine($"Transport {transportId} arrived at waypoint {i} ({waypoint.lat:F6}, {waypoint.lng:F6})");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Failed to handle transport {transportId} arrival at waypoint {i}: {ex.Message}");
                        }

                        // If this is an intermediate waypoint and transport is now waiting, stop simulation
                        if (!waypoint.isDestination)
                        {
                            try
                            {
                                using var scope = _serviceScopeFactory.CreateScope();
                                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                                var orders = await orderService.GetAllOrdersAsync();
                                var currentOrder = orders.FirstOrDefault(o => o.Transport.TransportId == transportId);

                                if (currentOrder?.Transport.Status == TransportStatus.Waiting)
                                {
                                    Console.WriteLine($"Transport {transportId} is waiting at waypoint {i}, stopping simulation");
                                    // Clean up active simulation but KEEP the state in Redis for positioning
                                    _activeSimulations.TryRemove(transportId, out _);
                                    return;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error checking transport status after waypoint arrival: {ex.Message}");
                            }
                        }
                    }
                }

                // Broadcast position update
                await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("Position", new
                {
                    transportId,
                    lng = position.lng,
                    lat = position.lat
                }, cancellationToken);

                // Persist state every ~1 second (with thread-safe locking)
                var now = DateTimeOffset.UtcNow;
                if ((now - lastPersistTime).TotalSeconds >= 1.0)
                {
                    var state = new TransportSimState(transportId, routeCacheKey, metersAlong, now);
                    await _simStateStore.SetAsync(state);
                    lastPersistTime = now;
                }

                // Wait for next tick
                await Task.Delay(tickMs, cancellationToken);
            }

            // Transport completed - get final position for waypoint determination
            var finalPosition = runner.At(metersAlong);

            // Only send final arrival event if we haven't already handled the final destination
            var finalDestinationIndex = waypoints.Count - 1;
            if (finalDestinationIndex >= 0 && !visitedWaypoints.Contains(finalDestinationIndex))
            {
                // Final broadcast
                await _hubContext.Clients.Group($"transport:{transportId}").SendAsync("TransportArrived", new
                {
                    transportId,
                    isIntermediateWaypoint = false,
                    waypointIndex = finalDestinationIndex,
                    lat = finalPosition.lat,
                    lng = finalPosition.lng
                }, cancellationToken);

                // Handle arrival logic using a new scope
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                    await orderService.HandleTransportArrivalAsync(transportId, finalPosition.lat, finalPosition.lng, cancellationToken);
                    Console.WriteLine($"Transport {transportId} arrival handled successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to handle transport {transportId} arrival: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"Transport {transportId} simulation completed - final destination already handled during route");
            }

            // Clean up simulation state
            // await _simStateStore.RemoveAsync(transportId);
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
    /// Updates the global simulation speed multiplier
    /// </summary>
    /// <param name="transportId">The transport identifier (for backward compatibility - not used)</param>
    /// <param name="speedMps">New speed in meters per second (will be converted to multiplier)</param>
    [Obsolete("Use SetGlobalSimulationSpeed instead")]
    public async Task SetTransportSpeed(string transportId, double speedMps)
    {
        // Convert to multiplier (assuming base speed of 15 m/s)
        const double baseSpeed = 15.0;
        var multiplier = speedMps / baseSpeed;
        await SetGlobalSimulationSpeed(multiplier);
    }

    /// <summary>
    /// Updates the global simulation speed multiplier for all active transport simulations
    /// </summary>
    /// <param name="speedMultiplier">Speed multiplier (e.g., 1.0 = normal, 2.0 = 2x speed)</param>
    public async Task SetGlobalSimulationSpeed(double speedMultiplier)
    {
        if (speedMultiplier <= 0)
            throw new ArgumentException("Speed multiplier must be positive", nameof(speedMultiplier));

        if (speedMultiplier > 1000)
            throw new ArgumentException("Speed multiplier cannot exceed 1000x for safety", nameof(speedMultiplier));

        try
        {
            // Store the global speed multiplier
            await _globalSimStore.SetSpeedMultiplierAsync(speedMultiplier);

            // Calculate actual speed for display purposes
            const double baseSpeedMps = 15.0;
            double actualSpeedMps = baseSpeedMps * speedMultiplier;

            // Get count of active transport simulations
            var activeTransportCount = _activeSimulations.Count;

            // Broadcast global speed change to all clients
            await _hubContext.Clients.All.SendAsync("GlobalSimulationSpeedChanged", new
            {
                speedMultiplier,
                speedMps = actualSpeedMps,
                activeTransportCount
            });

            Console.WriteLine($"Updated global simulation speed to {speedMultiplier}x ({actualSpeedMps:F1} m/s) for {activeTransportCount} active transports");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating global simulation speed: {ex.Message}");
            throw;
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

    /// <summary>
    /// Gets the current global simulation speed multiplier
    /// </summary>
    /// <returns>The current speed multiplier</returns>
    public async Task<double> GetGlobalSimulationSpeed()
    {
        return await _globalSimStore.GetSpeedMultiplierAsync();
    }

    /// <summary>
    /// Starts simulation for a waiting transport (e.g., when gate is assigned)
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    public async Task StartWaitingTransport(string transportId)
    {
        if (string.IsNullOrEmpty(transportId))
            return;

        try
        {
            // Update transport status to InProgress using service scope
            using var scope = _serviceScopeFactory.CreateScope();
            var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
            await orderService.UpdateTransportStatusAsync(transportId, TransportStatus.InProgress);

            // Get the order to retrieve route cache key
            var orders = await orderService.GetAllOrdersAsync();
            var order = orders.FirstOrDefault(o => o.Transport.TransportId == transportId);

            if (order != null && !string.IsNullOrEmpty(order.DirectionsCacheKey))
            {
                // Broadcast status update to all clients
                await _hubContext.Clients.All.SendAsync("TransportStatusChanged", new
                {
                    transportId,
                    status = TransportStatus.InProgress.ToString(),
                    order = order
                });

                // Start simulation
                _ = Task.Run(() => SimulateTransportPositions(transportId, order.DirectionsCacheKey), CancellationToken.None);

                Console.WriteLine($"Started simulation for waiting transport: {transportId}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error starting waiting transport {transportId}: {ex.Message}");
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Remove client from all transport groups they might be in
        // Note: SignalR automatically handles group cleanup on disconnect
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Calculates the distance between two geographic points in meters using Haversine formula
    /// </summary>
    private static double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double earthRadius = 6371000; // Earth radius in meters

        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadius * c;
    }
}