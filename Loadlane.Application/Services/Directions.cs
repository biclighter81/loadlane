using System.Text.Json;
using Application.Logging;
using Application.Records;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Application.Services;

public class DirectionsService
{
    private readonly MapboxOptions _opts;
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILoggerManager _logger;

    public DirectionsService(
        IOptions<MapboxOptions> opts,
        HttpClient httpClient,
        IMemoryCache cache,
        ILoggerManager logger
    )
    {
        _opts = opts.Value;
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Route> GetOrCreateRouteAsync((double lng, double lat) a, (double lng, double lat) b)
    {
        // Cache key by endpoints + profile
        var key = $"route:{_opts.Profile}:{a.lng:F6},{a.lat:F6}->{b.lng:F6},{b.lat:F6}";
        if (_cache.TryGetValue<Route>(key, out var cached))
            return cached!;

        // Request GeoJSON geometry to avoid decoding
        var url =
            $"https://api.mapbox.com/directions/v5/mapbox.{_opts.Profile}/{a.lng},{a.lat};{b.lng},{b.lat}" +
            $"?alternatives=false&geometries=geojson&overview=full&steps=false&access_token={_opts.AccessToken}";

        using var resp = await _httpClient.GetAsync(url);
        resp.EnsureSuccessStatusCode();

        using var stream = await resp.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var routeJson = doc.RootElement.GetProperty("routes")[0];
        var distance = routeJson.GetProperty("distance").GetDouble(); // meters
        var duration = routeJson.GetProperty("duration").GetDouble(); // seconds
        var coordsJson = routeJson.GetProperty("geometry").GetProperty("coordinates");

        var coords = new List<(double lng, double lat)>(coordsJson.GetArrayLength());
        foreach (var c in coordsJson.EnumerateArray())
            coords.Add((c[0].GetDouble(), c[1].GetDouble()));

        var route = new Route(coords, distance, duration);
        // cache for an hour (tune as needed)
        _cache.Set(key, route, TimeSpan.FromHours(1));
        return route;
    }
}