namespace Mobility.Entities;

public sealed record Driver(
    Guid Id,
    string Name,
    VehicleType VehicleType,
    bool IsAvailable);
