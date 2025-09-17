using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loadlane.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LoadLaneInit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "articles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    weight = table.Column<decimal>(type: "numeric(10,3)", precision: 10, scale: 3, nullable: true),
                    volume = table.Column<decimal>(type: "numeric(10,3)", precision: 10, scale: 3, nullable: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_articles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "carriers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    contact_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    contact_phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_carriers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "drivers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_drivers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "locations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    house_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    post_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    latitude = table.Column<double>(type: "double precision", precision: 10, scale: 8, nullable: false),
                    longitude = table.Column<double>(type: "double precision", precision: 11, scale: 8, nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_locations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tenants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ext_order_no = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    article_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_orders_articles_article_id",
                        column: x => x.article_id,
                        principalTable: "articles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    licence_plate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    licence_plate2 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    driver_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vehicles", x => x.id);
                    table.ForeignKey(
                        name: "fk_vehicles_drivers_driver_id",
                        column: x => x.driver_id,
                        principalTable: "drivers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "warehouses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organisation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_warehouses", x => x.id);
                    table.ForeignKey(
                        name: "fk_warehouses_locations_location_id",
                        column: x => x.location_id,
                        principalTable: "locations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "gates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gates", x => x.id);
                    table.ForeignKey(
                        name: "fk_gates_warehouse_warehouse_id",
                        column: x => x.warehouse_id,
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    transport_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_documents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "positions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    latitude = table.Column<double>(type: "double precision", precision: 10, scale: 8, nullable: false),
                    longitude = table.Column<double>(type: "double precision", precision: 11, scale: 8, nullable: false),
                    transport_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_positions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "transports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    transport_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    vehicle_id = table.Column<Guid>(type: "uuid", nullable: true),
                    carrier_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_id = table.Column<Guid>(type: "uuid", nullable: true),
                    destination_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    accepted_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transports", x => x.id);
                    table.ForeignKey(
                        name: "fk_transports_carriers_carrier_id",
                        column: x => x.carrier_id,
                        principalTable: "carriers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_transports_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_transports_vehicle_vehicle_id",
                        column: x => x.vehicle_id,
                        principalTable: "vehicles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "waypoints",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    planned_arrival = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_arrival = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_departure = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    waypoint_type = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    sequence_number = table.Column<int>(type: "integer", nullable: true),
                    next_stopp_id = table.Column<Guid>(type: "uuid", nullable: true),
                    transport_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_waypoints", x => x.id);
                    table.ForeignKey(
                        name: "fk_waypoints_locations_location_id",
                        column: x => x.location_id,
                        principalTable: "locations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_waypoints_transports_transport_id",
                        column: x => x.transport_id,
                        principalTable: "transports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_waypoints_waypoints_next_stopp_id",
                        column: x => x.next_stopp_id,
                        principalTable: "waypoints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_articles_name",
                table: "articles",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_carriers_contact_email",
                table: "carriers",
                column: "contact_email");

            migrationBuilder.CreateIndex(
                name: "ix_carriers_name",
                table: "carriers",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_documents_created_utc",
                table: "documents",
                column: "created_utc");

            migrationBuilder.CreateIndex(
                name: "ix_documents_name",
                table: "documents",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_documents_transport_id",
                table: "documents",
                column: "transport_id");

            migrationBuilder.CreateIndex(
                name: "ix_drivers_email",
                table: "drivers",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_drivers_phone",
                table: "drivers",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_gates_number",
                table: "gates",
                column: "number");

            migrationBuilder.CreateIndex(
                name: "ix_gates_warehouse_id",
                table: "gates",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_gates_warehouse_number_unique",
                table: "gates",
                columns: new[] { "warehouse_id", "number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_locations_coordinates",
                table: "locations",
                columns: new[] { "latitude", "longitude" });

            migrationBuilder.CreateIndex(
                name: "ix_orders_article_id",
                table: "orders",
                column: "article_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_ext_order_no",
                table: "orders",
                column: "ext_order_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_positions_coordinates",
                table: "positions",
                columns: new[] { "latitude", "longitude" });

            migrationBuilder.CreateIndex(
                name: "ix_positions_date",
                table: "positions",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "ix_positions_transport_id",
                table: "positions",
                column: "transport_id");

            migrationBuilder.CreateIndex(
                name: "ix_tenants_is_active",
                table: "tenants",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_tenants_name_unique",
                table: "tenants",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_transports_carrier_id",
                table: "transports",
                column: "carrier_id");

            migrationBuilder.CreateIndex(
                name: "ix_transports_destination_id",
                table: "transports",
                column: "destination_id");

            migrationBuilder.CreateIndex(
                name: "ix_transports_order_id",
                table: "transports",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_transports_start_id",
                table: "transports",
                column: "start_id");

            migrationBuilder.CreateIndex(
                name: "ix_transports_status",
                table: "transports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_transports_transport_id",
                table: "transports",
                column: "transport_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_transports_vehicle_id",
                table: "transports",
                column: "vehicle_id");

            migrationBuilder.CreateIndex(
                name: "ix_vehicles_driver_id",
                table: "vehicles",
                column: "driver_id");

            migrationBuilder.CreateIndex(
                name: "ix_vehicles_licence_plate",
                table: "vehicles",
                column: "licence_plate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_location_id",
                table: "warehouses",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_name",
                table: "warehouses",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_organisation",
                table: "warehouses",
                column: "organisation");

            migrationBuilder.CreateIndex(
                name: "ix_stopps_sequence_number",
                table: "waypoints",
                column: "sequence_number");

            migrationBuilder.CreateIndex(
                name: "ix_waypoints_location_id",
                table: "waypoints",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ix_waypoints_next_stopp_id",
                table: "waypoints",
                column: "next_stopp_id");

            migrationBuilder.CreateIndex(
                name: "ix_waypoints_transport_id",
                table: "waypoints",
                column: "transport_id");

            migrationBuilder.AddForeignKey(
                name: "fk_documents_transport_transport_id",
                table: "documents",
                column: "transport_id",
                principalTable: "transports",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_waypoints_transports_transport_id",
                table: "waypoints");

            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "gates");

            migrationBuilder.DropTable(
                name: "positions");

            migrationBuilder.DropTable(
                name: "tenants");

            migrationBuilder.DropTable(
                name: "warehouses");

            migrationBuilder.DropTable(
                name: "transports");

            migrationBuilder.DropTable(
                name: "carriers");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "vehicles");

            migrationBuilder.DropTable(
                name: "waypoints");

            migrationBuilder.DropTable(
                name: "articles");

            migrationBuilder.DropTable(
                name: "drivers");

            migrationBuilder.DropTable(
                name: "locations");
        }
    }
}
