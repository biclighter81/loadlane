using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Organisation)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Location
        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey("LocationId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // One-to-many relationship with Gates
        builder.HasMany(x => x.Gates)
            .WithOne(x => x.Warehouse)
            .HasForeignKey("WarehouseId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Organisation)
            .HasDatabaseName("ix_warehouses_organisation");

        builder.HasIndex(x => x.Name)
            .HasDatabaseName("ix_warehouses_name");

        builder.HasIndex("LocationId")
            .HasDatabaseName("ix_warehouses_location_id");
    }
}