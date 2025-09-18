namespace Loadlane.Application.DTOs;

public sealed record DockedVehicleDto(
    string Id,
    string LicensePlate,
    string Carrier,
    string Driver,
    string Vin,
    string GateId,
    int DockingPosition,
    bool IsActive,
    string GateType,
    string GateDescription,
    DateTime? ArrivalTime,
    DateTime? DepartureTime
);