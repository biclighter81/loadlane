namespace Loadlane.Domain.Entities;

public sealed class Gate
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public int Number { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public Warehouse Warehouse { get; private set; } = null!;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Gate() { }

    public Gate(int number, Warehouse warehouse, string? description = null)
    {
        Number = number;
        Warehouse = warehouse;
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

    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    public void UpdateNumber(int number)
    {
        Number = number;
    }
}