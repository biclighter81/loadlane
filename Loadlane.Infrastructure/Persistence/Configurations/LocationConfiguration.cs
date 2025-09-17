using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("locations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Street)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.HouseNo)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.PostCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Latitude)
            .IsRequired()
            .HasPrecision(10, 8);

        builder.Property(x => x.Longitude)
            .IsRequired()
            .HasPrecision(11, 8);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        builder.HasIndex(x => new { x.Latitude, x.Longitude })
            .HasDatabaseName("ix_locations_coordinates");
    }
}