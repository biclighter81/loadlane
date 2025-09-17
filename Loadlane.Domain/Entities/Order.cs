namespace Loadlane.Domain.Entities;

public sealed class Order
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string ExtOrderNo { get; private set; }
    public int Quantity { get; private set; }
    public Article Article { get; private set; } = null!;
    public string? DirectionsCacheKey { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<Transport> _transports = [];
    public IReadOnlyCollection<Transport> Transports => _transports.AsReadOnly();

    private Order() { ExtOrderNo = string.Empty; }

    public Order(string extOrderNo, int quantity, Article article)
    {
        ExtOrderNo = extOrderNo;
        Quantity = quantity;
        Article = article;
    }

    public void UpdateQuantity(int newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(newQuantity));

        Quantity = newQuantity;
    }

    public void UpdateExternalOrderNumber(string extOrderNo)
    {
        ExtOrderNo = extOrderNo;
    }

    public void AddTransport(Transport transport)
    {
        _transports.Add(transport);
    }

    public void SetDirectionsCacheKey(string cacheKey)
    {
        DirectionsCacheKey = cacheKey;
    }
}