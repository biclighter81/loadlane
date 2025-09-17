namespace Loadlane.Application.DTOs;

// Request DTOs
public sealed record CreateWarehouseDto(
    string Organisation,
    string Name,
    LocationDto Location,
    List<CreateGateDto>? Gates = null
);

public sealed record UpdateWarehouseDto(
    string Organisation,
    string Name,
    LocationDto Location
);

public sealed record CreateGateDto(
    int Number,
    string? Description = null
);

public sealed record UpdateGateDto(
    int Number,
    string? Description = null,
    bool IsActive = true
);

// Response DTOs
public sealed record WarehouseResponseDto(
    Guid Id,
    string Organisation,
    string Name,
    LocationResponseDto Location,
    List<GateResponseDto> Gates,
    DateTime CreatedUtc
);

public sealed record GateResponseDto(
    Guid Id,
    int Number,
    string? Description,
    bool IsActive,
    WarehouseResponseDto? Warehouse,
    DateTime CreatedUtc
);

public sealed record GateSimpleResponseDto(
    Guid Id,
    string Number,
    string? Description,
    bool IsActive,
    DateTime CreatedUtc
);