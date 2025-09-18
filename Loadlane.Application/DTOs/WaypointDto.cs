using Loadlane.Application.DTOs;

namespace Loadlane.Application.DTOs;

public sealed record WaypointResponseDto(
    Guid Id,
    DateTime? PlannedArrival,
    DateTime? ActualArrival,
    DateTime? ActualDeparture,
    LocationResponseDto Location,
    GateResponseDto? Gate,
    DateTime CreatedUtc,
    bool IsDelayed,
    bool HasArrived,
    bool HasDeparted
);

public sealed record UpdateWaypointDto(
    DateTime? ActualArrival = null,
    Guid? GateId = null
);