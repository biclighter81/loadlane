using System.Globalization;
using System.Text.Json;
using Application.Logging;
using Application.Records;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace Application.Services;

public class DirectionsService
{
    private readonly MapboxOptions _opts;
    private readonly HttpClient _httpClient;
    private readonly IDistributedCache _cache;
    private readonly ILoggerManager _logger;

    public DirectionsService(
        IOptions<MapboxOptions> opts,
        HttpClient httpClient,
        IDistributedCache cache,
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

        // Try to get cached route
        var cachedJson = await _cache.GetStringAsync(key);
        if (!string.IsNullOrEmpty(cachedJson))
        {
            var deserializedRoute = JsonSerializer.Deserialize<CachedRoute>(cachedJson);
            if (deserializedRoute != null)
                return deserializedRoute.ToRoute();
        }

        // Request GeoJSON geometry to avoid decoding
        string LonLat(double lng, double lat) => $"{lng.ToString("G17", CultureInfo.InvariantCulture)},{lat.ToString("G17", CultureInfo.InvariantCulture)}";

        var coordsString = $"{LonLat(a.lng, a.lat)};{LonLat(b.lng, b.lat)}";
        var url =
            $"https://api.mapbox.com/directions/v5/mapbox/{_opts.Profile}/{coordsString}" +
            $"?alternatives=false&geometries=geojson&overview=full&steps=false&access_token={Uri.EscapeDataString(_opts.AccessToken)}";

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

        // Cache for an hour (tune as needed) - serialize to JSON for Redis
        var cachedRoute = CachedRoute.FromRoute(route);
        var serializedRoute = JsonSerializer.Serialize(cachedRoute);
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        };
        await _cache.SetStringAsync(key, serializedRoute, cacheOptions);

        return route;
    }
}