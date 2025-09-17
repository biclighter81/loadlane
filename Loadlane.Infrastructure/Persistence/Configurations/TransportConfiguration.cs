using Loadlane.Domain.Entities;
using Loadlane.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class TransportConfiguration : IEntityTypeConfiguration<Transport>
{
    public void Configure(EntityTypeBuilder<Transport> builder)
    {
        builder.ToTable("transports");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TransportId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        builder.Property(x => x.AcceptedUtc);

        builder.Property(x => x.RejectedUtc);

        builder.Property(x => x.RejectionReason)
            .HasMaxLength(500);

        // Navigation property to Order (optional)
        builder.HasOne(x => x.Order)
            .WithMany(x => x.Transports)
            .HasForeignKey("OrderId")
            .OnDelete(DeleteBehavior.SetNull);

        // Navigation property to Vehicle (optional)
        builder.HasOne(x => x.Vehicle)
            .WithMany(x => x.Transports)
            .HasForeignKey("VehicleId")
            .OnDelete(DeleteBehavior.SetNull);

        // Navigation property to Carrier (optional)
        builder.HasOne(x => x.Carrier)
            .WithMany(x => x.Transports)
            .HasForeignKey("CarrierId")
            .OnDelete(DeleteBehavior.SetNull);

        // Navigation property to Start (optional)
        builder.HasOne(x => x.Start)
            .WithMany()
            .HasForeignKey("StartId")
            .OnDelete(DeleteBehavior.SetNull);

        // Navigation property to Destination (optional)
        builder.HasOne(x => x.Destination)
            .WithMany()
            .HasForeignKey("DestinationId")
            .OnDelete(DeleteBehavior.SetNull);

        // One-to-many relationships
        builder.HasMany(x => x.Stopps)
            .WithOne()
            .HasForeignKey("TransportId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Positions)
            .WithOne(x => x.Transport)
            .HasForeignKey("TransportId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Documents)
            .WithOne(x => x.Transport)
            .HasForeignKey("TransportId")
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.Status)
            .HasDatabaseName("ix_transports_status");

        builder.HasIndex("OrderId")
            .HasDatabaseName("ix_transports_order_id");

        builder.HasIndex("VehicleId")
            .HasDatabaseName("ix_transports_vehicle_id");

        builder.HasIndex("CarrierId")
            .HasDatabaseName("ix_transports_carrier_id");
    }
}