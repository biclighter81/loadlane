using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Services;

public interface ICarrierService
{
    Task<CarrierResponseDto> CreateCarrierAsync(CreateCarrierDto createCarrierDto, CancellationToken cancellationToken = default);
    Task<CarrierResponseDto?> GetCarrierByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<CarrierResponseDto>> GetAllCarriersAsync(CancellationToken cancellationToken = default);
    Task<CarrierResponseDto?> UpdateCarrierAsync(Guid id, UpdateCarrierDto updateCarrierDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteCarrierAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class CarrierService : ICarrierService
{
    private readonly ICarrierRepository _carrierRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CarrierService(
        ICarrierRepository carrierRepository,
        IUnitOfWork unitOfWork)
    {
        _carrierRepository = carrierRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CarrierResponseDto> CreateCarrierAsync(CreateCarrierDto createCarrierDto, CancellationToken cancellationToken = default)
    {
        // Check if carrier with same name already exists
        if (await _carrierRepository.ExistsByNameAsync(createCarrierDto.Name, cancellationToken))
        {
            throw new InvalidOperationException($"Carrier with name '{createCarrierDto.Name}' already exists.");
        }

        var carrier = new Carrier(
            createCarrierDto.Name,
            createCarrierDto.ContactEmail,
            createCarrierDto.ContactPhone);

        await _carrierRepository.AddAsync(carrier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponseDto(carrier);
    }

    public async Task<CarrierResponseDto?> GetCarrierByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var carrier = await _carrierRepository.GetByIdAsync(id, cancellationToken);
        return carrier != null ? MapToResponseDto(carrier) : null;
    }

    public async Task<List<CarrierResponseDto>> GetAllCarriersAsync(CancellationToken cancellationToken = default)
    {
        var carriers = await _carrierRepository.GetAllAsync(cancellationToken);
        return carriers.Select(MapToResponseDto).ToList();
    }

    public async Task<CarrierResponseDto?> UpdateCarrierAsync(Guid id, UpdateCarrierDto updateCarrierDto, CancellationToken cancellationToken = default)
    {
        var carrier = await _carrierRepository.GetByIdAsync(id, cancellationToken);
        if (carrier == null)
        {
            return null;
        }

        // Check if another carrier with the same name already exists
        var existingCarrier = await _carrierRepository.GetByNameAsync(updateCarrierDto.Name, cancellationToken);
        if (existingCarrier != null && existingCarrier.Id != id)
        {
            throw new InvalidOperationException($"Carrier with name '{updateCarrierDto.Name}' already exists.");
        }

        carrier.UpdateContactInfo(
            updateCarrierDto.Name,
            updateCarrierDto.ContactEmail,
            updateCarrierDto.ContactPhone);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponseDto(carrier);
    }

    public async Task<bool> DeleteCarrierAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var carrier = await _carrierRepository.GetByIdAsync(id, cancellationToken);
        if (carrier == null)
        {
            return false;
        }

        _carrierRepository.Delete(carrier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static CarrierResponseDto MapToResponseDto(Carrier carrier)
    {
        return new CarrierResponseDto(
            carrier.Id,
            carrier.Name,
            carrier.ContactEmail,
            carrier.ContactPhone,
            carrier.CreatedUtc);
    }
}