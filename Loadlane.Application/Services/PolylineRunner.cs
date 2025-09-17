namespace Loadlane.Application.Services;

/// <summary>
/// Utility for distance-based interpolation along a polyline (route coordinates).
/// Precomputes cumulative distances for efficient position lookup.
/// </summary>
public sealed class PolylineRunner
{
    private readonly IReadOnlyList<(double lng, double lat)> _coords;
    private readonly double[] _cumulativeMeters;

    public double TotalMeters { get; }

    public PolylineRunner(IReadOnlyList<(double lng, double lat)> coords)
    {
        _coords = coords ?? throw new ArgumentNullException(nameof(coords));

        if (coords.Count == 0)
            throw new ArgumentException("Coordinates cannot be empty", nameof(coords));

        // Precompute cumulative distances
        _cumulativeMeters = new double[coords.Count];
        _cumulativeMeters[0] = 0.0;

        for (int i = 1; i < coords.Count; i++)
        {
            var distance = Haversine(coords[i - 1], coords[i]);
            _cumulativeMeters[i] = _cumulativeMeters[i - 1] + distance;
        }

        TotalMeters = _cumulativeMeters[^1];
    }

    /// <summary>
    /// Returns the position (lng, lat) at the specified distance along the route.
    /// Uses binary search + linear interpolation for efficiency.
    /// </summary>
    /// <param name="meters">Distance along the route in meters</param>
    /// <returns>Interpolated position (longitude, latitude)</returns>
    public (double lng, double lat) At(double meters)
    {
        // Clamp to valid range
        if (meters <= 0) return _coords[0];
        if (meters >= TotalMeters) return _coords[^1];

        // Binary search to find the segment containing this distance
        int left = 0, right = _cumulativeMeters.Length - 1;

        while (left < right - 1)
        {
            int mid = (left + right) / 2;
            if (_cumulativeMeters[mid] <= meters)
                left = mid;
            else
                right = mid;
        }

        // Linear interpolation between coords[left] and coords[right]
        var segmentStart = _cumulativeMeters[left];
        var segmentEnd = _cumulativeMeters[right];
        var segmentLength = segmentEnd - segmentStart;

        if (segmentLength == 0) return _coords[left];

        var t = (meters - segmentStart) / segmentLength;
        var a = _coords[left];
        var b = _coords[right];

        return (
            lng: a.lng + (b.lng - a.lng) * t,
            lat: a.lat + (b.lat - a.lat) * t
        );
    }

    /// <summary>
    /// Haversine distance calculation in meters (same as RouteSampler)
    /// </summary>
    private static double Haversine((double lng, double lat) a, (double lng, double lat) b)
    {
        const double R = 6371000.0; // Earth radius in meters
        double ToRad(double d) => d * Math.PI / 180.0;

        var dLat = ToRad(b.lat - a.lat);
        var dLng = ToRad(b.lng - a.lng);
        var lat1 = ToRad(a.lat);
        var lat2 = ToRad(b.lat);

        var h = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        return 2 * R * Math.Asin(Math.Min(1, Math.Sqrt(h)));
    }
}