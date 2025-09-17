using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace Loadlane.Application.Services;

/// <summary>
/// Manages global simulation settings with Redis persistence
/// </summary>
public sealed class GlobalSimulationStore
{
    private readonly IDistributedCache _cache;
    private const string SpeedMultiplierKey = "global:sim:speed_multiplier";
    private const double DefaultSpeedMultiplier = 1.0;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromDays(1);

    public GlobalSimulationStore(IDistributedCache cache)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    /// <summary>
    /// Gets the current global speed multiplier
    /// </summary>
    /// <returns>The speed multiplier (default: 1.0)</returns>
    public async Task<double> GetSpeedMultiplierAsync()
    {
        try
        {
            var json = await _cache.GetStringAsync(SpeedMultiplierKey);
            if (string.IsNullOrEmpty(json))
                return DefaultSpeedMultiplier;

            return JsonSerializer.Deserialize<double>(json);
        }
        catch
        {
            // If there's any issue reading, return default
            return DefaultSpeedMultiplier;
        }
    }

    /// <summary>
    /// Sets the global speed multiplier
    /// </summary>
    /// <param name="speedMultiplier">The new speed multiplier</param>
    public async Task SetSpeedMultiplierAsync(double speedMultiplier)
    {
        if (speedMultiplier <= 0)
            throw new ArgumentException("Speed multiplier must be positive", nameof(speedMultiplier));

        var json = JsonSerializer.Serialize(speedMultiplier);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = DefaultTtl
        };

        await _cache.SetStringAsync(SpeedMultiplierKey, json, options);
    }

    /// <summary>
    /// Calculates the actual speed in m/s based on the global multiplier
    /// </summary>
    /// <param name="baseSpeedMps">Base speed in meters per second (default: 15 m/s ≈ 54 km/h)</param>
    /// <returns>The actual speed to use for simulation</returns>
    public async Task<double> GetCurrentSpeedAsync(double baseSpeedMps = 15.0)
    {
        var multiplier = await GetSpeedMultiplierAsync();
        return baseSpeedMps * multiplier;
    }
}