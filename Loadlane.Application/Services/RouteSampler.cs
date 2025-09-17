public sealed class RouteSampler
{
    // Haversine in meters
    private static double Haversine((double lng, double lat) a, (double lng, double lat) b)
    {
        const double R = 6371000.0;
        double ToRad(double d) => d * Math.PI / 180.0;
        var dLat = ToRad(b.lat - a.lat);
        var dLng = ToRad(b.lng - a.lng);
        var lat1 = ToRad(a.lat);
        var lat2 = ToRad(b.lat);
        var h = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return 2 * R * Math.Asin(Math.Min(1, Math.Sqrt(h)));
    }

    public List<(double lng, double lat)> Resample(IReadOnlyList<(double lng, double lat)> coords, double stepMeters = 25)
    {
        var output = new List<(double lng, double lat)>();
        if (coords.Count == 0) return output;

        output.Add(coords[0]);
        double carried = 0;

        for (int i = 0; i < coords.Count - 1; i++)
        {
            var a = coords[i];
            var b = coords[i + 1];
            var segLen = Haversine(a, b);
            if (segLen == 0) continue;

            var dirLng = b.lng - a.lng;
            var dirLat = b.lat - a.lat;

            double dist = carried;
            while (dist + stepMeters <= segLen)
            {
                var t = (dist + stepMeters) / segLen;
                output.Add((a.lng + dirLng * t, a.lat + dirLat * t));
                dist += stepMeters;
            }

            carried = (dist + stepMeters) - segLen;
            if (carried < 0) carried = 0;
        }

        // ensure end point
        var last = coords[^1];
        if (output.Count == 0 || (output[^1].lng != last.lng || output[^1].lat != last.lat))
            output.Add(last);

        return output;
    }
}
