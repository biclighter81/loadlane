namespace Loadlane.Domain.Entities;

public sealed class Stopp : Waypoint
{
    public int SequenceNumber { get; private set; }
    public Stopp? NextStopp { get; private set; }

    private Stopp() : base() { }

    public Stopp(Location location, int sequenceNumber, DateTime? plannedArrival = null, Gate? gate = null)
        : base(location, plannedArrival, gate)
    {
        SequenceNumber = sequenceNumber;
    }

    public static Stopp Create(Location location, int sequenceNumber, DateTime? plannedArrival = null, Gate? gate = null)
    {
        return new Stopp(location, sequenceNumber, plannedArrival, gate);
    }

    public void SetNextStopp(Stopp nextStopp)
    {
        NextStopp = nextStopp;
    }

    public void UpdateSequence(int newSequenceNumber)
    {
        SequenceNumber = newSequenceNumber;
    }
}