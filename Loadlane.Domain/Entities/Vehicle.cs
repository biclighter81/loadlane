namespace Loadlane.Domain.Entities;

public sealed class Vehicle
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string LicencePlate { get; private set; }
    public string? LicencePlate2 { get; private set; }
    public Driver? Driver { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<Transport> _transports = [];
    public IReadOnlyCollection<Transport> Transports => _transports.AsReadOnly();

    private Vehicle() { }

    public Vehicle(string licencePlate, string? licencePlate2 = null)
    {
        LicencePlate = licencePlate;
        LicencePlate2 = licencePlate2;
    }

    public void AssignDriver(Driver driver)
    {
        Driver = driver;
    }

    public void RemoveDriver()
    {
        Driver = null;
    }

    public void UpdateLicencePlates(string licencePlate, string? licencePlate2 = null)
    {
        LicencePlate = licencePlate;
        LicencePlate2 = licencePlate2;
    }
}