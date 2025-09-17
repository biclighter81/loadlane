namespace Loadlane.Domain.Entities;

public sealed class Driver
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<Vehicle> _vehicles = [];
    public IReadOnlyCollection<Vehicle> Vehicles => _vehicles.AsReadOnly();

    private Driver() { }

    public Driver(string name, string phone, string? email = null)
    {
        Name = name;
        Phone = phone;
        Email = email;
    }

    public void UpdateContactInfo(string name, string phone, string? email = null)
    {
        Name = name;
        Phone = phone;
        Email = email;
    }
}