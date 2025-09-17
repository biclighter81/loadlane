using Loadlane.Domain.Enums;

namespace Loadlane.Application.DTOs;

public sealed record OrderResponseDto(
    Guid Id,
    string ExtOrderNo,
    int Quantity,
    ArticleResponseDto Article,
    TransportResponseDto Transport,
    string? DirectionsCacheKey,
    DateTime CreatedUtc
);

public sealed record ArticleResponseDto(
    Guid Id,
    string Name,
    string? Description,
    decimal? Weight,
    decimal? Volume
);

public sealed record TransportResponseDto(
    Guid Id,
    string TransportId,
    TransportStatus Status,
    CarrierResponseDto? Carrier,
    LocationResponseDto? StartLocation,
    LocationResponseDto? DestinationLocation,
    List<StoppResponseDto> Stopps,
    DateTime CreatedUtc
);

public sealed record LocationResponseDto(
    Guid Id,
    string City,
    string Street,
    string HouseNo,
    string PostCode,
    double Latitude,
    double Longitude
);

public sealed record StoppResponseDto(
    Guid Id,
    int SequenceNumber,
    DateTime? PlannedArrival,
    DateTime? ActualArrival,
    LocationResponseDto Location
);