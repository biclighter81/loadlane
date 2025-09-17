using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class GateConfiguration : IEntityTypeConfiguration<Gate>
{
    public void Configure(EntityTypeBuilder<Gate> builder)
    {
        builder.ToTable("gates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Number)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Warehouse
        builder.HasOne(x => x.Warehouse)
            .WithMany(x => x.Gates)
            .HasForeignKey("WarehouseId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("WarehouseId")
            .HasDatabaseName("ix_gates_warehouse_id");

        builder.HasIndex(x => new { x.Number })
            .HasDatabaseName("ix_gates_number");

        // Composite unique index for warehouse + gate number
        builder.HasIndex(new[] { "WarehouseId", "Number" })
            .IsUnique()
            .HasDatabaseName("ix_gates_warehouse_number_unique");
    }
}