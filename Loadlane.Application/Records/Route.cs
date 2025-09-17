namespace Application.Records;

public sealed record Route(IReadOnlyList<(double lng, double lat)> Coords, double DistanceMeters, double DurationSeconds);