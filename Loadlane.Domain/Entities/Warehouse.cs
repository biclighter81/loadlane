namespace Loadlane.Domain.Entities;

public sealed class Warehouse
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Organisation { get; private set; }
    public string Name { get; private set; }
    public Location Location { get; private set; } = null!;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<Gate> _gates = [];
    public IReadOnlyCollection<Gate> Gates => _gates.AsReadOnly();

    private Warehouse() { }

    public Warehouse(string organisation, string name, Location location)
    {
        Organisation = organisation;
        Name = name;
        Location = location;
    }

    public void UpdateDetails(string organisation, string name, Location location)
    {
        Organisation = organisation;
        Name = name;
        Location = location;
    }

    public void AddGate(Gate gate)
    {
        _gates.Add(gate);
    }

    public void RemoveGate(Guid gateId)
    {
        var gate = _gates.FirstOrDefault(g => g.Id == gateId);
        if (gate != null)
        {
            _gates.Remove(gate);
        }
    }
}