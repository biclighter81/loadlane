using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByExtOrderNoAsync(string extOrderNo, CancellationToken cancellationToken = default);
}