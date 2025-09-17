using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loadlane.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GateToWaypoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "gate_id",
                table: "waypoints",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_waypoints_gate_id",
                table: "waypoints",
                column: "gate_id");

            migrationBuilder.AddForeignKey(
                name: "fk_waypoints_gates_gate_id",
                table: "waypoints",
                column: "gate_id",
                principalTable: "gates",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_waypoints_gates_gate_id",
                table: "waypoints");

            migrationBuilder.DropIndex(
                name: "ix_waypoints_gate_id",
                table: "waypoints");

            migrationBuilder.DropColumn(
                name: "gate_id",
                table: "waypoints");
        }
    }
}
