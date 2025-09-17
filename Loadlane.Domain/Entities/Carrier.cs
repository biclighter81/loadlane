namespace Loadlane.Domain.Entities;

public sealed class Carrier
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<Transport> _transports = [];
    public IReadOnlyCollection<Transport> Transports => _transports.AsReadOnly();

    private Carrier() { }

    public Carrier(string name, string? contactEmail = null, string? contactPhone = null)
    {
        Name = name;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
    }

    public void UpdateContactInfo(string name, string? contactEmail = null, string? contactPhone = null)
    {
        Name = name;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
    }
}