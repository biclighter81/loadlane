using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class PositionConfiguration : IEntityTypeConfiguration<Position>
{
    public void Configure(EntityTypeBuilder<Position> builder)
    {
        builder.ToTable("positions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Date)
            .IsRequired();

        builder.Property(x => x.Latitude)
            .IsRequired()
            .HasPrecision(10, 8);

        builder.Property(x => x.Longitude)
            .IsRequired()
            .HasPrecision(11, 8);

        // Navigation property to Transport
        builder.HasOne(x => x.Transport)
            .WithMany(x => x.Positions)
            .HasForeignKey("TransportId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("TransportId")
            .HasDatabaseName("ix_positions_transport_id");

        builder.HasIndex(x => x.Date)
            .HasDatabaseName("ix_positions_date");

        builder.HasIndex(x => new { x.Latitude, x.Longitude })
            .HasDatabaseName("ix_positions_coordinates");
    }
}