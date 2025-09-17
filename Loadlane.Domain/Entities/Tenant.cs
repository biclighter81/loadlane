namespace Loadlane.Domain.Entities;

public sealed class Tenant
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Tenant() { }

    public Tenant(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }

    public void UpdateDetails(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}