using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface IGateRepository
{
    Task AddAsync(Gate gate, CancellationToken cancellationToken = default);
    Task<Gate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Gate>> GetByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<List<Gate>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByNumberAndWarehouseAsync(int number, Guid warehouseId, CancellationToken cancellationToken = default);
    Task<List<DockedVehicleDto>> GetDockedVehiclesByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    void Update(Gate gate);
    void Delete(Gate gate);
}