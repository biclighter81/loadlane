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
        return await _context.Waypoints
            .Include(w => w.Location)
            .Include(w => w.Gate)
                .ThenInclude(g => g!.Warehouse)
                    .ThenInclude(w => w.Location)
            .Where(w => EF.Property<Guid?>(w, "TransportId") == transportId)
            .OrderBy(w => w.CreatedUtc)
            .ToListAsync(cancellationToken);
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