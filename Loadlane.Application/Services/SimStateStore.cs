using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace Loadlane.Application.Services;

/// <summary>
/// Record representing the simulation state of a transport
/// </summary>
public sealed record TransportSimState(
    string TransportId,
    string RouteKey,
    double MetersAlong,
    double SpeedMps,
    DateTimeOffset UpdatedUtc
);

/// <summary>
/// Redis-backed store for transport simulation state persistence
/// </summary>
public sealed class SimStateStore
{
    private readonly IDistributedCache _cache;
    private const string KeyPrefix = "sim:";
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(6);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public SimStateStore(IDistributedCache cache)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    /// <summary>
    /// Retrieves the simulation state for a transport
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    /// <returns>The transport simulation state, or null if not found</returns>
    public async Task<TransportSimState?> GetAsync(string transportId)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        var key = KeyPrefix + transportId;
        var json = await _cache.GetStringAsync(key);

        if (string.IsNullOrEmpty(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<TransportSimState>(json, JsonOptions);
        }
        catch (JsonException)
        {
            // Invalid JSON, remove corrupt entry
            await _cache.RemoveAsync(key);
            return null;
        }
    }

    /// <summary>
    /// Persists the simulation state for a transport
    /// </summary>
    /// <param name="state">The transport simulation state to save</param>
    /// <param name="ttl">Optional time-to-live; defaults to 6 hours</param>
    public async Task SetAsync(TransportSimState state, TimeSpan? ttl = null)
    {
        if (state == null)
            throw new ArgumentNullException(nameof(state));

        if (string.IsNullOrEmpty(state.TransportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(state));

        var key = KeyPrefix + state.TransportId;
        var json = JsonSerializer.Serialize(state, JsonOptions);

        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl ?? DefaultTtl
        };

        await _cache.SetStringAsync(key, json, options);
    }

    /// <summary>
    /// Removes the simulation state for a transport
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    public async Task RemoveAsync(string transportId)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        var key = KeyPrefix + transportId;
        await _cache.RemoveAsync(key);
    }

    /// <summary>
    /// Updates only the speed and timestamp for a transport (for speed changes)
    /// </summary>
    /// <param name="transportId">The transport identifier</param>
    /// <param name="speedMps">The new speed in meters per second</param>
    /// <param name="updatedUtc">The update timestamp</param>
    /// <returns>True if the state was updated, false if no existing state found</returns>
    public async Task<bool> UpdateSpeedAsync(string transportId, double speedMps, DateTimeOffset updatedUtc)
    {
        var existingState = await GetAsync(transportId);
        if (existingState == null)
            return false;

        var updatedState = existingState with
        {
            SpeedMps = speedMps,
            UpdatedUtc = updatedUtc
        };

        await SetAsync(updatedState);
        return true;
    }
}