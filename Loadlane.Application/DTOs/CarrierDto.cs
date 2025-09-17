namespace Loadlane.Application.DTOs;

public sealed record CarrierDto(
    string Name,
    string? ContactEmail = null,
    string? ContactPhone = null
);

public sealed record CarrierResponseDto(
    Guid Id,
    string Name,
    string? ContactEmail,
    string? ContactPhone,
    DateTime CreatedUtc
);