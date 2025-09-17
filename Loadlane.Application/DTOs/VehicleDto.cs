namespace Loadlane.Application.DTOs;

public sealed record VehicleDto(
    string Id,
    string LicensePlate,
    string Carrier,
    string DriverName,
    string DriverContact
);