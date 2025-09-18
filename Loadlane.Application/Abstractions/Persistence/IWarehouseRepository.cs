using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface IWarehouseRepository
{
    Task AddAsync(Warehouse warehouse, CancellationToken cancellationToken = default);
    Task<Warehouse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Warehouse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Warehouse?> GetByLocationAsync(double latitude, double longitude, double toleranceMeters = 100, CancellationToken cancellationToken = default);
    void Update(Warehouse warehouse);
    void Delete(Warehouse warehouse);
}