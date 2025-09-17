using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class WaypointConfiguration : IEntityTypeConfiguration<Waypoint>
{
    public void Configure(EntityTypeBuilder<Waypoint> builder)
    {
        builder.ToTable("waypoints");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlannedArrival);

        builder.Property(x => x.ActualArrival);

        builder.Property(x => x.ActualDeparture);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Location
        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey("LocationId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Optional navigation property to Gate
        builder.HasOne(x => x.Gate)
            .WithMany()
            .HasForeignKey("GateId")
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // Computed properties are ignored
        builder.Ignore(x => x.IsDelayed);
        builder.Ignore(x => x.HasArrived);
        builder.Ignore(x => x.HasDeparted);

        // Discriminator for inheritance
        builder.HasDiscriminator<string>("WaypointType")
            .HasValue<Start>("Start")
            .HasValue<Stopp>("Stopp")
            .HasValue<Destination>("Destination");

        builder.HasIndex("LocationId")
            .HasDatabaseName("ix_waypoints_location_id");

        builder.HasIndex("GateId")
            .HasDatabaseName("ix_waypoints_gate_id");
    }
}