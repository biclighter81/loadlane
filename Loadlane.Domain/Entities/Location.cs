namespace Loadlane.Domain.Entities;

public sealed class Location
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string City { get; private set; }
    public string Street { get; private set; }
    public string HouseNo { get; private set; }
    public string PostCode { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Location() { }

    public Location(string city, string street, string houseNo, string postCode, double latitude, double longitude)
    {
        City = city;
        Street = street;
        HouseNo = houseNo;
        PostCode = postCode;
        Latitude = latitude;
        Longitude = longitude;
    }

    public void UpdateCoordinates(double latitude, double longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }

    public void UpdateAddress(string city, string street, string houseNo, string postCode)
    {
        City = city;
        Street = street;
        HouseNo = houseNo;
        PostCode = postCode;
    }
}