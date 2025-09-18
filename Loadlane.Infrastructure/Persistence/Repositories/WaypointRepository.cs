using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class WaypointRepository : IWaypointRepository
{
    private readonly AppDbContext _context;

    public WaypointRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Waypoint>> GetByTransportIdAsync(Guid transportId, CancellationToken cancellationToken = default)
    {
        /*
         * Option 2: Union Query Implementation
         *
         * Problem: Transport has different relationships with waypoint types:
         * - Stopp: Direct foreign key TransportId -> can query directly
         * - Start: Transport.StartId references waypoint -> requires join
         * - Destination: Transport.DestinationId references waypoint -> requires join
         *
         * Solution: Combine three separate queries using UNION for complete coverage
         */

        // Helper method to build include chain (avoid duplication)
        static IQueryable<T> BuildIncludes<T>(IQueryable<T> query) where T : Waypoint
        {
            return query
                .Include(w => w.Location)
                .Include(w => w.Gate)
                    .ThenInclude(g => g!.Warehouse)
                        .ThenInclude(w => w.Location);
        }

        // First, get the transport to check if it exists and get Start/Destination IDs efficiently
        var transport = await _context.Transports
            .Where(t => t.Id == transportId)
            .Select(t => new { t.Id, StartId = t.Start!.Id, DestinationId = t.Destination!.Id })
            .FirstOrDefaultAsync(cancellationToken);

        if (transport == null)
        {
            return new List<Waypoint>();
        }

        // Query 1: Stopps with direct TransportId foreign key
        var stopps = await BuildIncludes(_context.Stopps)
            .Where(s => EF.Property<Guid?>(s, "TransportId") == transportId)
            .ToListAsync(cancellationToken);

        // Query 2: Start waypoint by ID (more efficient than Contains)
        var starts = await BuildIncludes(_context.Starts)
            .Where(s => s.Id == transport.StartId)
            .ToListAsync(cancellationToken);

        // Query 3: Destination waypoint by ID (more efficient than Contains)
        var destinations = await BuildIncludes(_context.Destinations)
            .Where(d => d.Id == transport.DestinationId)
            .ToListAsync(cancellationToken);

        // Combine results and convert to Waypoint base type
        var waypoints = new List<Waypoint>();
        waypoints.AddRange(stopps.Cast<Waypoint>());
        waypoints.AddRange(starts.Cast<Waypoint>());
        waypoints.AddRange(destinations.Cast<Waypoint>());

        // Sort by creation time and return
        return waypoints.OrderBy(w => w.CreatedUtc).ToList();
    }

    public async Task<Waypoint?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Waypoints
            .Include(w => w.Location)
            .Include(w => w.Gate)
                .ThenInclude(g => g!.Warehouse)
                    .ThenInclude(w => w.Location)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<bool> UpdateWaypointAsync(Guid waypointId, DateTime? actualArrival = null, Gate? gate = null, CancellationToken cancellationToken = default)
    {
        var waypoint = await _context.Waypoints
            .FirstOrDefaultAsync(w => w.Id == waypointId, cancellationToken);

        if (waypoint == null)
            return false;

        // Update actual arrival time using domain method
        if (actualArrival.HasValue)
        {
            waypoint.RecordArrival(actualArrival.Value);
        }

        // Update gate assignment using domain method
        if (gate != null)
        {
            waypoint.SetGate(gate);
        }

        _context.Waypoints.Update(waypoint);
        return true;
    }
}