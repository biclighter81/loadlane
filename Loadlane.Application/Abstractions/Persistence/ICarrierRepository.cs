using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface ICarrierRepository
{
    Task<Carrier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Carrier?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Carrier carrier, CancellationToken cancellationToken = default);
    Task<List<Carrier>> GetAllAsync(CancellationToken cancellationToken = default);
}