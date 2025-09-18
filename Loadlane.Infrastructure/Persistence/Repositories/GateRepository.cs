using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class GateRepository : IGateRepository
{
    private readonly AppDbContext _context;

    public GateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Gate gate, CancellationToken cancellationToken = default)
    {
        await _context.Gates.AddAsync(gate, cancellationToken);
    }

    public async Task<Gate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Gates
            .Include(g => g.Warehouse)
                .ThenInclude(w => w.Location)
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<List<Gate>> GetByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _context.Gates
            .Include(g => g.Warehouse)
                .ThenInclude(w => w.Location)
            .Where(g => g.Warehouse.Id == warehouseId)
            .OrderBy(g => g.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Gate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Gates
            .Include(g => g.Warehouse)
                .ThenInclude(w => w.Location)
            .OrderBy(g => g.Warehouse.Name)
            .ThenBy(g => g.Number)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNumberAndWarehouseAsync(int number, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _context.Gates
            .AnyAsync(g => g.Number == number && g.Warehouse.Id == warehouseId, cancellationToken);
    }

    public async Task<List<DockedVehicleDto>> GetDockedVehiclesByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        // Simplified approach: Query transports and then check their waypoints
        var transports = await _context.Set<Transport>()
            .Where(t => t.Vehicle != null)
            .Include(t => t.Vehicle)
                .ThenInclude(v => v!.Driver)
            .Include(t => t.Carrier)
            .Include(t => t.Start)
                .ThenInclude(s => s!.Gate)
                    .ThenInclude(g => g!.Warehouse)
            .Include(t => t.Destination)
                .ThenInclude(d => d!.Gate)
                    .ThenInclude(g => g!.Warehouse)
            .Include(t => t.Stopps)
                .ThenInclude(s => s.Gate)
                    .ThenInclude(g => g!.Warehouse)
            .ToListAsync(cancellationToken);

        var dockedVehicles = transports
            .SelectMany(t => new object?[]
            {
                t.Start != null && t.Start.Gate != null && t.Start.Gate.Warehouse.Id == warehouseId 
                    && t.Start.ActualArrival.HasValue && !t.Start.ActualDeparture.HasValue 
                    ? new { Transport = t, Waypoint = t.Start } : null,
                t.Destination != null && t.Destination.Gate != null && t.Destination.Gate.Warehouse.Id == warehouseId 
                    && t.Destination.ActualArrival.HasValue && !t.Destination.ActualDeparture.HasValue 
                    ? new { Transport = t, Waypoint = t.Destination } : null
            }
            .Concat(t.Stopps.Where(s => s.Gate != null && s.Gate.Warehouse.Id == warehouseId 
                                    && s.ActualArrival.HasValue && !s.ActualDeparture.HasValue)
                           .Select(s => (object?)new { Transport = t, Waypoint = s }))
            .Where(x => x != null)
            .Cast<dynamic>())
            .Select(x => new DockedVehicleDto(
                x!.Transport.Vehicle!.Id.ToString(),
                x.Transport.Vehicle.LicencePlate,
                x.Transport.Carrier?.Name ?? "Unbekannt",
                x.Transport.Vehicle.Driver?.Name ?? "Unbekannt",
                x.Transport.Vehicle.LicencePlate,
                x.Waypoint.Gate!.Id.ToString(),
                x.Waypoint.Gate.Number,
                x.Waypoint.Gate.IsActive,
                "Loading",
                x.Waypoint.Gate.Description ?? "",
                x.Waypoint.ActualArrival,
                x.Waypoint.ActualDeparture
            ))
            .Distinct()
            .ToList();

        return dockedVehicles;
    }

    public void Update(Gate gate)
    {
        _context.Gates.Update(gate);
    }

    public void Delete(Gate gate)
    {
        _context.Gates.Remove(gate);
    }
}