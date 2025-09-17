using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class CarrierConfiguration : IEntityTypeConfiguration<Carrier>
{
    public void Configure(EntityTypeBuilder<Carrier> builder)
    {
        builder.ToTable("carriers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ContactEmail)
            .HasMaxLength(200);

        builder.Property(x => x.ContactPhone)
            .HasMaxLength(30);

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // One-to-many relationship with Transports
        builder.HasMany(x => x.Transports)
            .WithOne(x => x.Carrier)
            .HasForeignKey("CarrierId")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Name)
            .HasDatabaseName("ix_carriers_name");

        builder.HasIndex(x => x.ContactEmail)
            .HasDatabaseName("ix_carriers_contact_email");
    }
}