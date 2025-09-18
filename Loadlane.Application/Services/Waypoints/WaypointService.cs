using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Services.Waypoints;

public interface IWaypointService
{
    Task<IEnumerable<DockedVehicleDto>> GetDockedVehiclesAsync(string warehouseId, CancellationToken cancellationToken = default);
    Task<List<WaypointResponseDto>> GetWaypointsByTransportIdAsync(Guid transportId, CancellationToken cancellationToken = default);
    Task<bool> UpdateWaypointAsync(Guid waypointId, UpdateWaypointDto updateDto, CancellationToken cancellationToken = default);
}

public sealed class WaypointService : IWaypointService
{
    private readonly IGateRepository _gateRepository;
    private readonly IWaypointRepository _waypointRepository;

    public WaypointService(IGateRepository gateRepository, IWaypointRepository waypointRepository)
    {
        _gateRepository = gateRepository;
        _waypointRepository = waypointRepository;
    }

    public async Task<IEnumerable<DockedVehicleDto>> GetDockedVehiclesAsync(string warehouseId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(warehouseId, out var warehouseGuid))
        {
            return new List<DockedVehicleDto>();
        }

        return await _gateRepository.GetDockedVehiclesByWarehouseIdAsync(warehouseGuid, cancellationToken);
    }

    public async Task<List<WaypointResponseDto>> GetWaypointsByTransportIdAsync(Guid transportId, CancellationToken cancellationToken = default)
    {
        var waypoints = await _waypointRepository.GetByTransportIdAsync(transportId, cancellationToken);
        
        return waypoints.Select(MapToResponseDto).ToList();
    }

    public async Task<bool> UpdateWaypointAsync(Guid waypointId, UpdateWaypointDto updateDto, CancellationToken cancellationToken = default)
    {
        Gate? gate = null;
        
        if (updateDto.GateId.HasValue)
        {
            gate = await _gateRepository.GetByIdAsync(updateDto.GateId.Value, cancellationToken);
            if (gate == null)
            {
                throw new InvalidOperationException($"Gate with ID {updateDto.GateId.Value} not found");
            }
        }

        return await _waypointRepository.UpdateWaypointAsync(
            waypointId, 
            updateDto.ActualArrival, 
            gate, 
            cancellationToken);
    }

    private static WaypointResponseDto MapToResponseDto(Waypoint waypoint)
    {
        var locationDto = new LocationResponseDto(
            waypoint.Location.Id,
            waypoint.Location.City,
            waypoint.Location.Street,
            waypoint.Location.HouseNo,
            waypoint.Location.PostCode,
            waypoint.Location.Latitude,
            waypoint.Location.Longitude
        );

        GateResponseDto? gateDto = null;
        if (waypoint.Gate != null)
        {
            WarehouseResponseDto? warehouseDto = null;
            if (waypoint.Gate.Warehouse != null)
            {
                warehouseDto = new WarehouseResponseDto(
                    waypoint.Gate.Warehouse.Id,
                    waypoint.Gate.Warehouse.Organisation,
                    waypoint.Gate.Warehouse.Name,
                    new LocationResponseDto(
                        waypoint.Gate.Warehouse.Location.Id,
                        waypoint.Gate.Warehouse.Location.City,
                        waypoint.Gate.Warehouse.Location.Street,
                        waypoint.Gate.Warehouse.Location.HouseNo,
                        waypoint.Gate.Warehouse.Location.PostCode,
                        waypoint.Gate.Warehouse.Location.Latitude,
                        waypoint.Gate.Warehouse.Location.Longitude
                    ),
                    [],
                    waypoint.Gate.Warehouse.CreatedUtc
                );
            }

            gateDto = new GateResponseDto(
                waypoint.Gate.Id,
                waypoint.Gate.Number,
                waypoint.Gate.Description,
                waypoint.Gate.IsActive,
                warehouseDto,
                waypoint.Gate.CreatedUtc
            );
        }

        return new WaypointResponseDto(
            waypoint.Id,
            waypoint.PlannedArrival,
            waypoint.ActualArrival,
            waypoint.ActualDeparture,
            locationDto,
            gateDto,
            waypoint.CreatedUtc,
            waypoint.IsDelayed,
            waypoint.HasArrived,
            waypoint.HasDeparted
        );
    }
}