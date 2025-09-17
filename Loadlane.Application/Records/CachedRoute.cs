using System.Text.Json.Serialization;

namespace Application.Records;

/// <summary>
/// Serializable version of Route for caching purposes
/// </summary>
public sealed record CachedRoute
{
    [JsonPropertyName("coords")]
    public List<Coordinate> Coords { get; init; } = [];

    [JsonPropertyName("distance")]
    public double DistanceMeters { get; init; }

    [JsonPropertyName("duration")]
    public double DurationSeconds { get; init; }

    public Route ToRoute()
    {
        var coords = Coords.Select(c => (c.Lng, c.Lat)).ToList();
        return new Route(coords, DistanceMeters, DurationSeconds);
    }

    public static CachedRoute FromRoute(Route route)
    {
        var coords = route.Coords.Select(c => new Coordinate { Lng = c.lng, Lat = c.lat }).ToList();
        return new CachedRoute
        {
            Coords = coords,
            DistanceMeters = route.DistanceMeters,
            DurationSeconds = route.DurationSeconds
        };
    }
}

public sealed record Coordinate
{
    [JsonPropertyName("lng")]
    public double Lng { get; init; }

    [JsonPropertyName("lat")]
    public double Lat { get; init; }
}