namespace Loadlane.Domain.Entities;

public sealed class Destination : Waypoint
{
    private Destination() : base() { }

    public Destination(Location location, DateTime? plannedArrival = null, Gate? gate = null)
        : base(location, plannedArrival, gate)
    {
    }

    public static Destination Create(Location location, DateTime? plannedArrival = null, Gate? gate = null)
    {
        return new Destination(location, plannedArrival, gate);
    }
}