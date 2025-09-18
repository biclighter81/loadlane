namespace Loadlane.Application.DTOs;

public sealed record CreateOrderDto(
    string ExtOrderNo,
    int Quantity,
    Guid ArticleId,
    Guid CarrierId,
    LocationDto StartLocation,
    LocationDto DestinationLocation,
    DateTime? PlannedDeparture = null,
    DateTime? PlannedArrival = null,
    List<StoppDto>? Stopps = null
);

public sealed record StoppDto(
    LocationDto Location,
    int SequenceNumber,
    DateTime? PlannedArrival = null
);