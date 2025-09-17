using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
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

    public async Task<bool> ExistsByNumberAndWarehouseAsync(string number, Guid warehouseId, CancellationToken cancellationToken = default)
    {
        return await _context.Gates
            .AnyAsync(g => g.Number == number && g.Warehouse.Id == warehouseId, cancellationToken);
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