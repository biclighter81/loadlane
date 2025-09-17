using Loadlane.Domain.Enums;

namespace Loadlane.Domain.Entities;

public sealed class Transport
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string TransportId { get; private set; }
    public TransportStatus Status { get; private set; } = TransportStatus.Draft;

    public Order? Order { get; private set; }
    public Vehicle? Vehicle { get; private set; }
    public Carrier? Carrier { get; private set; }
    public Start? Start { get; private set; }
    public Destination? Destination { get; private set; }

    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? AcceptedUtc { get; private set; }
    public DateTime? RejectedUtc { get; private set; }
    public string? RejectionReason { get; private set; }

    private readonly List<Stopp> _stopps = [];
    public IReadOnlyCollection<Stopp> Stopps => _stopps.AsReadOnly();

    private readonly List<Position> _positions = [];
    public IReadOnlyCollection<Position> Positions => _positions.AsReadOnly();

    private readonly List<Document> _documents = [];
    public IReadOnlyCollection<Document> Documents => _documents.AsReadOnly();

    private Transport() { }

    public Transport(string transportId, Order? order = null)
    {
        TransportId = transportId;
        Order = order;
    }

    public void Accept(Vehicle vehicle)
    {
        if (Status != TransportStatus.Pending)
            throw new InvalidOperationException("Transport must be in pending status to accept");

        Status = TransportStatus.Accepted;
        Vehicle = vehicle;
        AcceptedUtc = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != TransportStatus.Pending)
            throw new InvalidOperationException("Transport must be in pending status to reject");

        Status = TransportStatus.Rejected;
        RejectionReason = reason;
        RejectedUtc = DateTime.UtcNow;
    }

    public void ChangeRoute(Stopp stopp, string reason, DateTime newTimeWindow)
    {
        if (!_stopps.Contains(stopp))
            throw new ArgumentException("Stopp not found in this transport", nameof(stopp));

        stopp.SetPlannedArrival(newTimeWindow);
    }

    public void SetCarrier(Carrier carrier)
    {
        Carrier = carrier;
    }

    public void SetRoute(Start start, Destination destination)
    {
        Start = start;
        Destination = destination;
    }

    public void AddStopp(Stopp stopp)
    {
        _stopps.Add(stopp);
    }

    public void AddPosition(Position position)
    {
        _positions.Add(position);
    }

    public void AddDocument(Document document)
    {
        _documents.Add(document);
    }

    public void StartTransport()
    {
        if (Status != TransportStatus.Accepted)
            throw new InvalidOperationException("Transport must be accepted to start");

        Status = TransportStatus.InProgress;
    }

    public void Complete()
    {
        if (Status != TransportStatus.InProgress)
            throw new InvalidOperationException("Transport must be in progress to complete");

        Status = TransportStatus.Completed;
    }

    public void Cancel()
    {
        if (Status == TransportStatus.Completed)
            throw new InvalidOperationException("Cannot cancel completed transport");

        Status = TransportStatus.Cancelled;
    }
}