using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("vehicles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LicencePlate)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.LicencePlate2)
            .HasMaxLength(20);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Driver (optional)
        builder.HasOne(x => x.Driver)
            .WithMany(x => x.Vehicles)
            .HasForeignKey("DriverId")
            .OnDelete(DeleteBehavior.SetNull);

        // One-to-many relationship with Transports
        builder.HasMany(x => x.Transports)
            .WithOne(x => x.Vehicle)
            .HasForeignKey("VehicleId")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.LicencePlate)
            .IsUnique()
            .HasDatabaseName("ix_vehicles_licence_plate");

        builder.HasIndex("DriverId")
            .HasDatabaseName("ix_vehicles_driver_id");
    }
}