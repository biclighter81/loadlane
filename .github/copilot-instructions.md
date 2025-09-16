# Copilot Instructions for the Loadlane Solution

> **Goal**: Teach Copilot how our Clean Architecture solution is organized so it can scaffold new code in the right place, with the right patterns and conventions.

These instructions describe **where files live**, **how they reference each other**, **how EF Core + Repository** are used, and our **coding conventions** (including **file‑scoped namespaces**).

---

## Solution Layout (top‑level projects)

```
Loadlane.sln
│
├── Loadlane.Api/            # Presentation (HTTP) – Minimal API/Controllers, DI wiring, pipeline
├── Loadlane.Application/    # Use cases, DTOs, CQRS, validators, mapping, repository interfaces
├── Loadlane.Domain/         # Entities, ValueObjects, Enums, Domain Events, Specifications
├── Loadlane.Infrastructure/ # EF Core, DbContext, Migrations, Repository impls, external services
├── Loadlane.Web/            # React frontend (Vite/React/SPA)
├── Loadlane.AppHost/        # .NET Aspire orchestration (wires Api, Web, Redis, Postgres, etc.)
└── Loadlane.ServiceDefaults/# Shared cross‑cutting defaults (resilience, logging, tracing)
```

### Project references (one way only)

- **Application → Domain**
- **Infrastructure → Application, Domain**
- **Api → Application (+ Infrastructure for DI only)**
- **Web** is independent (calls **Api** over HTTP)
- **AppHost** orchestrates services; **ServiceDefaults** is referenced by Api/other services as needed.

> **Rule**: Do **not** reference Infrastructure from Domain or Application types directly. Api should depend on Application abstractions; Infrastructure is injected via DI.

---

## Coding conventions

- **File‑scoped namespaces** only. Example: `namespace Loadlane.Domain.Orders;` (trailing semicolon, no braces).
- **C# 12/Latest** language features allowed.
- Nullable reference types **enabled**.
- **One type per file**; file name matches type name.
- Public APIs use **XML doc comments** when the intent is not obvious.
- Folders mirror namespaces.

---

## EF Core & Repository Pattern

We use EF Core in **Infrastructure** with the **Repository pattern**:

- **Domain**: Entities and ValueObjects – no EF dependencies.
- **Application**: Define **repository interfaces** (e.g., `IOrderRepository`) and **unit‑of‑work** (`IUnitOfWork` if needed). Application also defines **DTOs**, **commands/queries**, **validators**.
- **Infrastructure**: EF **DbContext**, **EntityTypeConfiguration** classes, **repositories implementing Application interfaces**, **migrations**, and DI registration extensions (e.g., `AddPersistence`).
- **Api**: Wires Application handlers/services and Infrastructure persistence in `Program.cs`.

### Example placements

```
Loadlane.Domain/
  Orders/
    Order.cs
    OrderStatus.cs

Loadlane.Application/
  Abstractions/
    Persistence/
      IUnitOfWork.cs
      Orders/
        IOrderRepository.cs
  Orders/
    DTOs/OrderDto.cs
    Commands/CreateOrder/
      CreateOrderCommand.cs
      CreateOrderHandler.cs
    Queries/GetOrderById/
      GetOrderByIdQuery.cs
      GetOrderByIdHandler.cs

Loadlane.Infrastructure/
  Persistence/
    LoadlaneDbContext.cs
    Configurations/
      Orders/OrderConfiguration.cs
    Repositories/
      Orders/OrderRepository.cs
    Migrations/
  DependencyInjection/
    PersistenceServiceCollectionExtensions.cs  # e.g., AddPersistence(...)

Loadlane.Api/
  Endpoints/
    OrdersEndpoints.cs   # Minimal API or controller
  Mappings/
  Program.cs
```

---

## Canonical code templates (use these when generating)

### Domain entity (file‑scoped namespace)

```csharp
namespace Loadlane.Domain.Orders;

public sealed class Order
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Number { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public DateTime CreatedUtc { get; private set; } = DateTime.UtcNow;

    private Order() {}
    public Order(string number) => Number = number;

    public void Confirm() => Status = OrderStatus.Confirmed;
}

public enum OrderStatus { Draft, Confirmed, Shipped }
```

### Application repository abstraction

```csharp
namespace Loadlane.Application.Abstractions.Persistence.Orders;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Order entity, CancellationToken ct = default);
    Task<bool> ExistsByNumberAsync(string number, CancellationToken ct = default);
}
```

### Optional Unit of Work abstraction

```csharp
namespace Loadlane.Application.Abstractions.Persistence;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
```

### Infrastructure: DbContext

```csharp
using Loadlane.Domain.Orders;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence;

public sealed class LoadlaneDbContext(DbContextOptions<LoadlaneDbContext> options)
    : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LoadlaneDbContext).Assembly);
    }
}
```

### Infrastructure: Entity configuration

```csharp
using Loadlane.Domain.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Loadlane.Infrastructure.Persistence.Configurations.Orders;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Number).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Status).HasConversion<string>();
        builder.Property(x => x.CreatedUtc).IsRequired();
        builder.HasIndex(x => x.Number).IsUnique();
    }
}
```

### Infrastructure: Repository implementation

```csharp
using Loadlane.Application.Abstractions.Persistence.Orders;
using Loadlane.Domain.Orders;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories.Orders;

public sealed class OrderRepository(LoadlaneDbContext db) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task AddAsync(Order entity, CancellationToken ct = default)
        => await db.Orders.AddAsync(entity, ct);

    public Task<bool> ExistsByNumberAsync(string number, CancellationToken ct = default)
        => db.Orders.AnyAsync(o => o.Number == number, ct);
}
```

### Infrastructure: DI registration

```csharp
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.Abstractions.Persistence.Orders;
using Loadlane.Infrastructure.Persistence;
using Loadlane.Infrastructure.Persistence.Repositories.Orders;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.DependencyInjection;

public static class PersistenceServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<LoadlaneDbContext>(o => o.UseNpgsql(connectionString));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<LoadlaneDbContext>());
        services.AddScoped<IOrderRepository, OrderRepository>();
        return services;
    }
}
```

### Api: wiring in Program.cs (Minimal API)

```csharp
using Loadlane.Application.Abstractions.Persistence.Orders;
using Loadlane.Domain.Orders;
using Loadlane.Infrastructure.DependencyInjection;

namespace Loadlane.Api;

var builder = WebApplication.CreateBuilder(args);

var cs = builder.Configuration.GetConnectionString("Database")!; // AppHost injects via Aspire
builder.Services.AddPersistence(cs);

var app = builder.Build();

app.MapPost("/orders", async (string number, IOrderRepository repo, IUnitOfWork uow) =>
{
    var order = new Order(number);
    await repo.AddAsync(order);
    await uow.SaveChangesAsync();
    return Results.Created($"/orders/{order.Id}", new { order.Id, order.Number, order.Status });
});

app.MapGet("/orders/{id:guid}", async (Guid id, IOrderRepository repo) =>
{
    var order = await repo.GetByIdAsync(id);
    return order is null ? Results.NotFound() : Results.Ok(order);
});

app.Run();
```

---

## How to ask Copilot (prompt cookbook)

Use these patterns so Copilot knows **exactly** where to place files:

- **Add a new entity**:
  _“Create a new Domain entity `Shipment` in `Loadlane.Domain/Shipments/Shipment.cs` with file‑scoped namespace `Loadlane.Domain.Shipments;`, immutable ValueObject `Address`, and an enum `ShipmentStatus`. Provide an EF configuration in `Loadlane.Infrastructure/Persistence/Configurations/Shipments/ShipmentConfiguration.cs`.”_

- **Add a repository**:
  _“Add `IShipmentRepository` to `Loadlane.Application/Abstractions/Persistence/Shipments/IShipmentRepository.cs` and implement it as `ShipmentRepository` in `Loadlane.Infrastructure/Persistence/Repositories/Shipments/ShipmentRepository.cs` using `LoadlaneDbContext`.”_

- **Add a use case**:
  _“Create command `CreateShipmentCommand` and handler in `Loadlane.Application/Shipments/Commands/CreateShipment/`. The handler uses `IShipmentRepository` + `IUnitOfWork` and returns the created DTO.”_

- **Expose endpoint**:
  _“Add minimal API endpoints for shipments in `Loadlane.Api/Endpoints/ShipmentsEndpoints.cs` that call the Application layer and follow our DI setup.”_

- **DbContext update**:
  _“Update `LoadlaneDbContext` to include `DbSet<Shipment>` and register it in `AddPersistence`.”_

- **Migrations**:
  _“Generate EF Core migrations in `Loadlane.Infrastructure` targeting `LoadlaneDbContext`.”_

---

## Aspire links (for Copilot context)

- **AppHost** controls service wiring (Postgres/Redis/Api/Web). Connection strings are injected into Api as named connection strings, typically `Database`.
- **ServiceDefaults** provides common telemetry/resilience; Api should call `builder.AddServiceDefaults()` if used.

---

## Checklist for new vertical feature

1. **Domain**: entity/value objects/enums added.
2. **Application**: repository interface + use case (command/query) + DTOs + validators.
3. **Infrastructure**: DbContext `DbSet<>`, configuration, repository implementation, DI registration, migration.
4. **Api**: endpoint mapping that uses Application abstractions.
5. **Web**: (optional) React pages calling Api.
6. **AppHost**: no changes unless new external resource needed.

> If Copilot suggests placing EF or HTTP code in Domain or Application entities, **reject** it. EF code belongs to **Infrastructure** only; Application depends on **abstractions**.
