namespace Loadlane.Domain.Entities;

public sealed class Document
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string FilePath { get; private set; }
    public string MimeType { get; private set; }
    public long FileSize { get; private set; }
    public Transport Transport { get; private set; } = null!;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Document() { }

    public Document(string name, string filePath, string mimeType, long fileSize, Transport transport, string? description = null)
    {
        Name = name;
        FilePath = filePath;
        MimeType = mimeType;
        FileSize = fileSize;
        Transport = transport;
        Description = description;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
    }
}