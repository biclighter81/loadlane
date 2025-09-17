namespace Loadlane.Domain.Entities;

public sealed class Article
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public decimal? Weight { get; private set; }
    public decimal? Volume { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Article() { }

    public Article(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }

    public void UpdateDetails(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }

    public void SetDimensions(decimal weight, decimal volume)
    {
        Weight = weight;
        Volume = volume;
    }
}