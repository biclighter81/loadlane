namespace Loadlane.Application.DTOs;

public sealed record DockingDto(
    VehicleDto? Vehicle,
    GatesDto Gate,
    DateTime? ArrivalTime,
    DateTime? DepartureTime
);

