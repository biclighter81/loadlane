using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class StoppConfiguration : IEntityTypeConfiguration<Stopp>
{
    public void Configure(EntityTypeBuilder<Stopp> builder)
    {
        builder.Property(x => x.SequenceNumber)
            .IsRequired();

        // Self-referencing relationship for next stop
        builder.HasOne(x => x.NextStopp)
            .WithMany()
            .HasForeignKey("NextStoppId")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.SequenceNumber)
            .HasDatabaseName("ix_stopps_sequence_number");
    }
}