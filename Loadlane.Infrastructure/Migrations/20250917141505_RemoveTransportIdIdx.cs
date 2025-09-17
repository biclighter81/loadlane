using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loadlane.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTransportIdIdx : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_transports_transport_id",
                table: "transports");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_transports_transport_id",
                table: "transports",
                column: "transport_id",
                unique: true);
        }
    }
}
