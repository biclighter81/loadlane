using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class WarehouseRepository : IWarehouseRepository
{
    private readonly AppDbContext _context;

    public WarehouseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Warehouse warehouse, CancellationToken cancellationToken = default)
    {
        await _context.Warehouses.AddAsync(warehouse, cancellationToken);
    }

    public async Task<Warehouse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Warehouses
            .Include(w => w.Location)
            .Include(w => w.Gates)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<List<Warehouse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Warehouses
            .Include(w => w.Location)
            .Include(w => w.Gates)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Warehouses
            .AnyAsync(w => w.Name == name, cancellationToken);
    }

    public async Task<Warehouse?> GetByLocationAsync(double latitude, double longitude, double toleranceMeters = 100, CancellationToken cancellationToken = default)
    {
        // Calculate approximate degree tolerance based on meters
        // This is a rough approximation: 1 degree ≈ 111,000 meters at the equator
        var toleranceDegrees = toleranceMeters / 111000.0;

        return await _context.Warehouses
            .Include(w => w.Location)
            .Include(w => w.Gates)
            .Where(w =>
                Math.Abs(w.Location.Latitude - latitude) <= toleranceDegrees &&
                Math.Abs(w.Location.Longitude - longitude) <= toleranceDegrees)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public void Update(Warehouse warehouse)
    {
        _context.Warehouses.Update(warehouse);
    }

    public void Delete(Warehouse warehouse)
    {
        _context.Warehouses.Remove(warehouse);
    }
}