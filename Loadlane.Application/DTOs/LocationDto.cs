namespace Loadlane.Application.DTOs;

public sealed record LocationDto(
    string City,
    string Street,
    string HouseNo,
    string PostCode,
    double Latitude,
    double Longitude
);