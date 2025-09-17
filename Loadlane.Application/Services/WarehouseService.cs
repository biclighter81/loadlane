using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Services;

public interface IWarehouseService
{
    Task<WarehouseResponseDto> CreateWarehouseAsync(CreateWarehouseDto createWarehouseDto, CancellationToken cancellationToken = default);
    Task<WarehouseResponseDto?> GetWarehouseByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<WarehouseResponseDto>> GetAllWarehousesAsync(CancellationToken cancellationToken = default);
    Task<WarehouseResponseDto?> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto updateWarehouseDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteWarehouseAsync(Guid id, CancellationToken cancellationToken = default);

    Task<GateResponseDto> CreateGateAsync(Guid warehouseId, CreateGateDto createGateDto, CancellationToken cancellationToken = default);
    Task<GateResponseDto?> GetGateByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GateResponseDto>> GetGatesByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task<GateResponseDto?> UpdateGateAsync(Guid id, UpdateGateDto updateGateDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteGateAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class WarehouseService : IWarehouseService
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IGateRepository _gateRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public WarehouseService(
        IWarehouseRepository warehouseRepository,
        IGateRepository gateRepository,
        ILocationRepository locationRepository,
        IUnitOfWork unitOfWork)
    {
        _warehouseRepository = warehouseRepository;
        _gateRepository = gateRepository;
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<WarehouseResponseDto> CreateWarehouseAsync(CreateWarehouseDto createWarehouseDto, CancellationToken cancellationToken = default)
    {
        // Check if warehouse with same name already exists
        if (await _warehouseRepository.ExistsByNameAsync(createWarehouseDto.Name, cancellationToken))
        {
            throw new InvalidOperationException($"Warehouse with name '{createWarehouseDto.Name}' already exists.");
        }

        // Create or get existing location
        var location = await GetOrCreateLocationAsync(createWarehouseDto.Location, cancellationToken);

        // Create warehouse
        var warehouse = new Warehouse(createWarehouseDto.Organisation, createWarehouseDto.Name, location);

        // Add gates if provided
        if (createWarehouseDto.Gates?.Any() == true)
        {
            foreach (var gateDto in createWarehouseDto.Gates)
            {
                var gate = new Gate(gateDto.Number, warehouse, gateDto.Description);
                warehouse.AddGate(gate);
            }
        }

        // Save to database
        await _warehouseRepository.AddAsync(warehouse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToWarehouseResponseDto(warehouse);
    }

    public async Task<WarehouseResponseDto?> GetWarehouseByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(id, cancellationToken);
        return warehouse != null ? MapToWarehouseResponseDto(warehouse) : null;
    }

    public async Task<List<WarehouseResponseDto>> GetAllWarehousesAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await _warehouseRepository.GetAllAsync(cancellationToken);
        return warehouses.Select(MapToWarehouseResponseDto).ToList();
    }

    public async Task<WarehouseResponseDto?> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto updateWarehouseDto, CancellationToken cancellationToken = default)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(id, cancellationToken);
        if (warehouse == null)
        {
            return null;
        }

        // Check if another warehouse with same name exists
        if (warehouse.Name != updateWarehouseDto.Name &&
            await _warehouseRepository.ExistsByNameAsync(updateWarehouseDto.Name, cancellationToken))
        {
            throw new InvalidOperationException($"Warehouse with name '{updateWarehouseDto.Name}' already exists.");
        }

        // Create or get location
        var location = await GetOrCreateLocationAsync(updateWarehouseDto.Location, cancellationToken);

        // Update warehouse
        warehouse.UpdateDetails(updateWarehouseDto.Organisation, updateWarehouseDto.Name, location);

        _warehouseRepository.Update(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToWarehouseResponseDto(warehouse);
    }

    public async Task<bool> DeleteWarehouseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(id, cancellationToken);
        if (warehouse == null)
        {
            return false;
        }

        _warehouseRepository.Delete(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<GateResponseDto> CreateGateAsync(Guid warehouseId, CreateGateDto createGateDto, CancellationToken cancellationToken = default)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(warehouseId, cancellationToken);
        if (warehouse == null)
        {
            throw new InvalidOperationException($"Warehouse with ID '{warehouseId}' not found.");
        }

        // Check if gate with same number already exists in this warehouse
        if (await _gateRepository.ExistsByNumberAndWarehouseAsync(createGateDto.Number, warehouseId, cancellationToken))
        {
            throw new InvalidOperationException($"Gate with number '{createGateDto.Number}' already exists in warehouse '{warehouse.Name}'.");
        }

        var gate = new Gate(createGateDto.Number, warehouse, createGateDto.Description);
        warehouse.AddGate(gate);

        await _gateRepository.AddAsync(gate, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToGateResponseDto(gate);
    }

    public async Task<GateResponseDto?> GetGateByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var gate = await _gateRepository.GetByIdAsync(id, cancellationToken);
        return gate != null ? MapToGateResponseDto(gate) : null;
    }

    public async Task<List<GateResponseDto>> GetGatesByWarehouseIdAsync(Guid warehouseId, CancellationToken cancellationToken = default)
    {
        var gates = await _gateRepository.GetByWarehouseIdAsync(warehouseId, cancellationToken);
        return gates.Select(MapToGateResponseDto).ToList();
    }

    public async Task<GateResponseDto?> UpdateGateAsync(Guid id, UpdateGateDto updateGateDto, CancellationToken cancellationToken = default)
    {
        var gate = await _gateRepository.GetByIdAsync(id, cancellationToken);
        if (gate == null)
        {
            return null;
        }

        // Check if another gate with same number exists in the warehouse
        if (gate.Number != updateGateDto.Number &&
            await _gateRepository.ExistsByNumberAndWarehouseAsync(updateGateDto.Number, gate.Warehouse.Id, cancellationToken))
        {
            throw new InvalidOperationException($"Gate with number '{updateGateDto.Number}' already exists in warehouse '{gate.Warehouse.Name}'.");
        }

        // Update gate properties
        gate.UpdateNumber(updateGateDto.Number);
        gate.UpdateDescription(updateGateDto.Description);

        if (updateGateDto.IsActive)
        {
            gate.Activate();
        }
        else
        {
            gate.Deactivate();
        }

        _gateRepository.Update(gate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToGateResponseDto(gate);
    }

    public async Task<bool> DeleteGateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var gate = await _gateRepository.GetByIdAsync(id, cancellationToken);
        if (gate == null)
        {
            return false;
        }

        _gateRepository.Delete(gate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<Location> GetOrCreateLocationAsync(LocationDto locationDto, CancellationToken cancellationToken)
    {
        var existingLocation = await _locationRepository.GetByCoordinatesAsync(
            locationDto.Latitude,
            locationDto.Longitude,
            cancellationToken);

        if (existingLocation != null)
        {
            return existingLocation;
        }

        var location = new Location(
            locationDto.City,
            locationDto.Street,
            locationDto.HouseNo,
            locationDto.PostCode,
            locationDto.Latitude,
            locationDto.Longitude);

        await _locationRepository.AddAsync(location, cancellationToken);
        return location;
    }

    private static WarehouseResponseDto MapToWarehouseResponseDto(Warehouse warehouse)
    {
        return new WarehouseResponseDto(
            warehouse.Id,
            warehouse.Organisation,
            warehouse.Name,
            new LocationResponseDto(
                warehouse.Location.Id,
                warehouse.Location.City,
                warehouse.Location.Street,
                warehouse.Location.HouseNo,
                warehouse.Location.PostCode,
                warehouse.Location.Latitude,
                warehouse.Location.Longitude),
            warehouse.Gates.Select(g => new GateResponseDto(
                g.Id,
                g.Number,
                g.Description,
                g.IsActive,
                null, // Avoid circular reference
                g.CreatedUtc)).ToList(),
            warehouse.CreatedUtc);
    }

    private static GateResponseDto MapToGateResponseDto(Gate gate)
    {
        return new GateResponseDto(
            gate.Id,
            gate.Number,
            gate.Description,
            gate.IsActive,
            new WarehouseResponseDto(
                gate.Warehouse.Id,
                gate.Warehouse.Organisation,
                gate.Warehouse.Name,
                new LocationResponseDto(
                    gate.Warehouse.Location.Id,
                    gate.Warehouse.Location.City,
                    gate.Warehouse.Location.Street,
                    gate.Warehouse.Location.HouseNo,
                    gate.Warehouse.Location.PostCode,
                    gate.Warehouse.Location.Latitude,
                    gate.Warehouse.Location.Longitude),
                new List<GateResponseDto>(), // Avoid circular reference
                gate.Warehouse.CreatedUtc),
            gate.CreatedUtc);
    }
}