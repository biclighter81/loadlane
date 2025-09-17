namespace Loadlane.Domain.Entities;

public sealed class Position
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime Date { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public Transport Transport { get; private set; } = null!;

    private Position() { }

    public Position(DateTime date, double latitude, double longitude, Transport transport)
    {
        Date = date;
        Latitude = latitude;
        Longitude = longitude;
        Transport = transport;
    }

    public static Position Create(double latitude, double longitude, Transport transport, DateTime? date = null)
    {
        return new Position(date ?? DateTime.UtcNow, latitude, longitude, transport);
    }
}