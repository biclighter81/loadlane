using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class CarrierRepository : ICarrierRepository
{
    private readonly AppDbContext _context;

    public CarrierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Carrier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Carriers
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Carrier?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Carriers
            .FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Carriers
            .AnyAsync(c => c.Name == name, cancellationToken);
    }

    public async Task AddAsync(Carrier carrier, CancellationToken cancellationToken = default)
    {
        await _context.Carriers.AddAsync(carrier, cancellationToken);
    }

    public async Task<List<Carrier>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Carriers
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}