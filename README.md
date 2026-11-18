# Urban Mobility: Layered Architecture

The same small ride application implemented in **C#/.NET 10** and **TypeScript/Node.js 24**. Each version has a Console app and an HTTP API.

## Architecture

```mermaid
block-beta
    columns 2

    block:Layers["Application Layers"]
        columns 1
        Presentation["1. Presentation<br/>Console / HTTP API"]
        Business["2. Business<br/>RideService / Repository Interfaces"]
        Data["3. Data<br/>In-Memory Repositories"]
    end

    block:Domain["Shared Domain"]
        columns 1
        Entities["Entities<br/><br/>Driver<br/>Ride<br/>RideStatus<br/>VehicleType"]
    end

    Presentation --> Business
    Business --> Data

    Presentation -.-> Entities
    Business -.-> Entities
    Data -.-> Entities

    style Presentation fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style Business fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Data fill:#fef3c7,stroke:#d97706,color:#78350f
    style Entities fill:#e0e7ff,stroke:#6366f1,color:#312e81

```

These are logical boundaries, not separate servers. Console and API use the same Business rules, but run as separate processes with separate in-memory data.

## Run C#/.NET

From the repository root, start either host:

```sh
dotnet run --project dotnet/src/Mobility.Console
```

```sh
dotnet run --project dotnet/src/Mobility.Api
```

The API is at `http://localhost:5080`; its interactive reference is [Scalar](http://localhost:5080/scalar/).

## Run TypeScript

Install dependencies once from the repository root:

```sh
cd typescript
npm ci
```

Then start either host from `typescript/`:

```sh
npm run dev:console
```

```sh
npm run dev:api
```

The API is at `http://localhost:5081`; its interactive reference is [Scalar](http://localhost:5081/scalar/).

## Build and test

From the repository root:

```sh
dotnet build dotnet/Mobility.slnx
dotnet test dotnet/Mobility.slnx
```

From `typescript/`:

```sh
npm run typecheck
npm run build
npm run test:unit
```

## Notes

- Both implementations seed six available demo drivers at startup; their IDs are printed to the console.
- Data is in memory and resets when its process stops. Console and API do not share data.
- This is a learning example, not production software: it has no authentication or persistent storage.
- See [`requests/`](requests/) for API request examples and [`docs/`](docs/) for classroom material.
