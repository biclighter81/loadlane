namespace Loadlane.Domain.Entities;

public sealed class Start : Waypoint
{
    private Start() : base() { }

    public Start(Location location, DateTime? plannedDeparture = null, Gate? gate = null)
        : base(location, plannedDeparture, gate)
    {
    }

    public static Start Create(Location location, DateTime? plannedDeparture = null, Gate? gate = null)
    {
        return new Start(location, plannedDeparture, gate);
    }
}