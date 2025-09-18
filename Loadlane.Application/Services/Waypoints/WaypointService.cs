using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;

namespace Loadlane.Application.Services.Waypoints;

public interface IWaypointService
{
    Task<IEnumerable<DockedVehicleDto>> GetDockedVehiclesAsync(string warehouseId, CancellationToken cancellationToken = default);
}

public sealed class WaypointService : IWaypointService
{
    private readonly IGateRepository _gateRepository;

    public WaypointService(IGateRepository gateRepository)
    {
        _gateRepository = gateRepository;
    }

    public async Task<IEnumerable<DockedVehicleDto>> GetDockedVehiclesAsync(string warehouseId, CancellationToken cancellationToken = default)
    {
        // Parse warehouseId to Guid
        if (!Guid.TryParse(warehouseId, out var warehouseGuid))
        {
            return new List<DockedVehicleDto>();
        }

        // Use the optimized repository method
        return await _gateRepository.GetDockedVehiclesByWarehouseIdAsync(warehouseGuid, cancellationToken);
    }
}