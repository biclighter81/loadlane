using Loadlane.Domain.Enums;

namespace Loadlane.Application.DTOs;

public sealed record VehicleResponseDto(
    Guid Id,
    string LicencePlate,
    string TrailerLicencePlate,
    DriverResponseDto? Driver,
    DateTime CreatedUtc
);
public sealed record DriverResponseDto(
    Guid Id,
    string Name,
    string Contact
);              