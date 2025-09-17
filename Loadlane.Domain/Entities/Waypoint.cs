namespace Loadlane.Domain.Entities;

public abstract class Waypoint
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime? PlannedArrival { get; private set; }
    public DateTime? ActualArrival { get; private set; }
    public DateTime? ActualDeparture { get; private set; }
    public Location Location { get; private set; } = null!;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    protected Waypoint() { }

    protected Waypoint(Location location, DateTime? plannedArrival = null)
    {
        Location = location;
        PlannedArrival = plannedArrival;
    }

    public void SetPlannedArrival(DateTime plannedArrival)
    {
        PlannedArrival = plannedArrival;
    }

    public void RecordArrival(DateTime arrivalTime)
    {
        ActualArrival = arrivalTime;
    }

    public void RecordDeparture(DateTime departureTime)
    {
        ActualDeparture = departureTime;
    }

    public bool IsDelayed => PlannedArrival.HasValue && ActualArrival.HasValue && ActualArrival > PlannedArrival;
    public bool HasArrived => ActualArrival.HasValue;
    public bool HasDeparted => ActualDeparture.HasValue;
}