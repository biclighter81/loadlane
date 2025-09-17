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
