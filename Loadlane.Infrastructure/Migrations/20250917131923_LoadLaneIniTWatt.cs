using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loadlane.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LoadLaneIniTWatt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_documents_transport_transport_id",
                table: "documents");

            migrationBuilder.DropForeignKey(
                name: "fk_gates_warehouse_warehouse_id",
                table: "gates");

            migrationBuilder.DropForeignKey(
                name: "fk_positions_transport_transport_id",
                table: "positions");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_vehicle_vehicle_id",
                table: "transports");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_waypoint_destination_id",
                table: "transports");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_waypoint_start_id",
                table: "transports");

            migrationBuilder.AddForeignKey(
                name: "fk_documents_transports_transport_id",
                table: "documents",
                column: "transport_id",
                principalTable: "transports",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_gates_warehouses_warehouse_id",
                table: "gates",
                column: "warehouse_id",
                principalTable: "warehouses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_positions_transports_transport_id",
                table: "positions",
                column: "transport_id",
                principalTable: "transports",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_destinations_destination_id",
                table: "transports",
                column: "destination_id",
                principalTable: "waypoints",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_starts_start_id",
                table: "transports",
                column: "start_id",
                principalTable: "waypoints",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_vehicles_vehicle_id",
                table: "transports",
                column: "vehicle_id",
                principalTable: "vehicles",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_documents_transports_transport_id",
                table: "documents");

            migrationBuilder.DropForeignKey(
                name: "fk_gates_warehouses_warehouse_id",
                table: "gates");

            migrationBuilder.DropForeignKey(
                name: "fk_positions_transports_transport_id",
                table: "positions");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_destinations_destination_id",
                table: "transports");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_starts_start_id",
                table: "transports");

            migrationBuilder.DropForeignKey(
                name: "fk_transports_vehicles_vehicle_id",
                table: "transports");

            migrationBuilder.AddForeignKey(
                name: "fk_documents_transport_transport_id",
                table: "documents",
                column: "transport_id",
                principalTable: "transports",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_gates_warehouse_warehouse_id",
                table: "gates",
                column: "warehouse_id",
                principalTable: "warehouses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_positions_transport_transport_id",
                table: "positions",
                column: "transport_id",
                principalTable: "transports",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_vehicle_vehicle_id",
                table: "transports",
                column: "vehicle_id",
                principalTable: "vehicles",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_waypoint_destination_id",
                table: "transports",
                column: "destination_id",
                principalTable: "waypoints",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_transports_waypoint_start_id",
                table: "transports",
                column: "start_id",
                principalTable: "waypoints",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
