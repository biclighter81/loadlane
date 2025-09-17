namespace Loadlane.Domain.Entities;

public sealed class Start : Waypoint
{
    private Start() : base() { }

    public Start(Location location, DateTime? plannedDeparture = null)
        : base(location, plannedDeparture)
    {
    }

    public static Start Create(Location location, DateTime? plannedDeparture = null)
    {
        return new Start(location, plannedDeparture);
    }
}