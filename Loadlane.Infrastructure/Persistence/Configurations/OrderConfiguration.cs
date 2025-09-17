using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ExtOrderNo)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Quantity)
            .IsRequired();

        builder.Property(x => x.CreatedUtc)
            .IsRequired();

        // Navigation property to Article
        builder.HasOne(x => x.Article)
            .WithMany()
            .HasForeignKey("ArticleId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // One-to-many relationship with Transports
        builder.HasMany(x => x.Transports)
            .WithOne(x => x.Order)
            .HasForeignKey("OrderId")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.ExtOrderNo)
            .IsUnique()
            .HasDatabaseName("ix_orders_ext_order_no");

        builder.HasIndex("ArticleId")
            .HasDatabaseName("ix_orders_article_id");
    }
}