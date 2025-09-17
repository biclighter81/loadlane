using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("drivers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Phone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(x => x.Email)
            .HasMaxLength(200);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // One-to-many relationship with Vehicles
        builder.HasMany(x => x.Vehicles)
            .WithOne(x => x.Driver)
            .HasForeignKey("DriverId")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Phone)
            .IsUnique()
            .HasDatabaseName("ix_drivers_phone");

        builder.HasIndex(x => x.Email)
            .HasDatabaseName("ix_drivers_email");
    }
}