namespace Loadlane.Domain.Entities;

public sealed class Destination : Waypoint
{
    private Destination() : base() { }

    public Destination(Location location, DateTime? plannedArrival = null)
        : base(location, plannedArrival)
    {
    }

    public static Destination Create(Location location, DateTime? plannedArrival = null)
    {
        return new Destination(location, plannedArrival);
    }
}