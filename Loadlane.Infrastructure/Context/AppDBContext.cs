using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();
    public DbSet<Start> Starts => Set<Start>();
    public DbSet<Stopp> Stopps => Set<Stopp>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Carrier> Carriers => Set<Carrier>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Gate> Gates => Set<Gate>();
    public DbSet<Tenant> Tenants => Set<Tenant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
