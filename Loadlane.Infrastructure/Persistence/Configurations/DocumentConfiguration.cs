using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.FileSize)
            .IsRequired();

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Transport
        builder.HasOne(x => x.Transport)
            .WithMany(x => x.Documents)
            .HasForeignKey("TransportId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("TransportId")
            .HasDatabaseName("ix_documents_transport_id");

        builder.HasIndex(x => x.Name)
            .HasDatabaseName("ix_documents_name");

        builder.HasIndex(x => x.CreatedUtc)
            .HasDatabaseName("ix_documents_created_utc");
    }
}