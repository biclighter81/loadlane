using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class LocationRepository : ILocationRepository
{
    private readonly AppDbContext _context;

    public LocationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Location location, CancellationToken cancellationToken = default)
    {
        await _context.Locations.AddAsync(location, cancellationToken);
    }

    public async Task<Location?> GetByCoordinatesAsync(double latitude, double longitude, CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .FirstOrDefaultAsync(l => l.Latitude == latitude && l.Longitude == longitude, cancellationToken);
    }
}