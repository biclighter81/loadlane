# Loadlane Domain Entities - Class Diagram

```mermaid
classDiagram
    %% Core Business Entities
    class Order {
        +Guid Id
        +string ExtOrderNo
        +int Quantity
        +DateTime CreatedUtc
        +UpdateQuantity(int newQuantity)
        +UpdateExternalOrderNumber(string extOrderNo)
        +AddTransport(Transport transport)
    }

    class Article {
        +Guid Id
        +string Name
        +string Description
        +decimal Weight
        +decimal Volume
        +DateTime CreatedUtc
        +UpdateDetails(string name, string description)
        +SetDimensions(decimal weight, decimal volume)
    }

    class Transport {
        +Guid Id
        +string TransportId
        +TransportStatus Status
        +DateTime CreatedUtc
        +DateTime AcceptedUtc
        +DateTime RejectedUtc
        +string RejectionReason
        +Accept(Guid vehicleId)
        +Reject(string reason)
        +SetCarrier(Guid carrierId)
        +SetRoute(Guid startId, Guid destinationId)
        +StartTransport()
        +Complete()
        +Cancel()
    }

    %% Location and Waypoint Hierarchy
    class Location {
        +Guid Id
        +string City
        +string Street
        +string HouseNo
        +string PostCode
        +double Latitude
        +double Longitude
        +DateTime CreatedUtc
        +UpdateCoordinates(double latitude, double longitude)
        +UpdateAddress(string city, string street, string houseNo, string postCode)
    }

    class Waypoint {
        <<abstract>>
        +Guid Id
        +DateTime PlannedArrival
        +DateTime ActualArrival
        +DateTime ActualDeparture
        +DateTime CreatedUtc
        +bool IsDelayed
        +bool HasArrived
        +bool HasDeparted
        +SetPlannedArrival(DateTime plannedArrival)
        +RecordArrival(DateTime arrivalTime)
        +RecordDeparture(DateTime departureTime)
    }

    class Start {
        +Create(Location location, DateTime plannedDeparture)
    }

    class Stopp {
        +int SequenceNumber
        +Create(Location location, int sequenceNumber, DateTime plannedArrival)
        +SetNextStopp(Stopp nextStopp)
        +UpdateSequence(int newSequenceNumber)
    }

    class Destination {
        +Create(Location location, DateTime plannedArrival)
    }

    %% Vehicle and Personnel
    class Vehicle {
        +Guid Id
        +string LicencePlate
        +string LicencePlate2
        +DateTime CreatedUtc
        +AssignDriver(Driver driver)
        +RemoveDriver()
        +UpdateLicencePlates(string licencePlate, string licencePlate2)
    }

    class Driver {
        +Guid Id
        +string Name
        +string Phone
        +string Email
        +DateTime CreatedUtc
        +UpdateContactInfo(string name, string phone, string email)
    }

    class Carrier {
        +Guid Id
        +string Name
        +string ContactEmail
        +string ContactPhone
        +DateTime CreatedUtc
        +UpdateContactInfo(string name, string contactEmail, string contactPhone)
    }

    %% Supporting Entities
    class Position {
        +Guid Id
        +DateTime Date
        +double Latitude
        +double Longitude
        +Create(double latitude, double longitude, Transport transport, DateTime date)
    }

    class Document {
        +Guid Id
        +string Name
        +string Description
        +string FilePath
        +string MimeType
        +long FileSize
        +DateTime CreatedUtc
        +UpdateDescription(string description)
    }

    class Warehouse {
        +Guid Id
        +string Organisation
        +string Name
        +DateTime CreatedUtc
        +UpdateDetails(string organisation, string name)
        +AddGate(Gate gate)
        +RemoveGate(Guid gateId)
    }

    class Gate {
        +Guid Id
        +string Number
        +string Description
        +bool IsActive
        +DateTime CreatedUtc
        +Activate()
        +Deactivate()
        +UpdateDescription(string description)
    }

    class Tenant {
        +Guid Id
        +string Name
        +string Description
        +bool IsActive
        +DateTime CreatedUtc
        +UpdateDetails(string name, string description)
        +Activate()
        +Deactivate()
    }

    %% Enums
    class TransportStatus {
        <<enumeration>>
        Draft
        Pending
        Accepted
        Rejected
        InProgress
        Completed
        Cancelled
    }

    %% Relationships
    Order ||--|| Article
    Order ||--o{ Transport

    Transport ||--o| Vehicle
    Transport ||--o| Carrier
    Transport ||--o| Start
    Transport ||--o| Destination
    Transport ||--o{ Stopp
    Transport ||--o{ Position
    Transport ||--o{ Document
    Transport ||--|| TransportStatus

    Waypoint <|-- Start
    Waypoint <|-- Stopp
    Waypoint <|-- Destination
    Waypoint ||--|| Location

    Vehicle ||--o| Driver
    Driver ||--o{ Vehicle

    Warehouse ||--|| Location
    Warehouse ||--o{ Gate

    Position ||--|| Transport
    Document ||--|| Transport
    Gate ||--|| Warehouse

    Stopp ||--o| Stopp
```

## Entity Overview

### Core Business Flow
1. **Order** contains **Article** and can have multiple **Transport** instances
2. **Transport** is the central hub connecting all logistics entities
3. **Waypoint** hierarchy (Start → Stopp → Destination) defines the route
4. **Position** tracking provides real-time location data

### Key Relationships
- **Transport** ↔ **Vehicle** (1:1 when assigned)
- **Transport** ↔ **Carrier** (1:1 when assigned)
- **Vehicle** ↔ **Driver** (bidirectional, 1:many)
- **Warehouse** → **Gate** (1:many)
- **All Waypoints** → **Location** (1:1)

### Transport Lifecycle
```
Draft → Pending → Accepted → InProgress → Completed
   ↓         ↓
Cancelled  Rejected
```