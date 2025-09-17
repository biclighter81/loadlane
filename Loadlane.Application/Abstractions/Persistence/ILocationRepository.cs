using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface ILocationRepository
{
    Task AddAsync(Location location, CancellationToken cancellationToken = default);
    Task<Location?> GetByCoordinatesAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}