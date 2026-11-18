namespace Mobility.Entities;

public sealed record Ride(
    Guid Id,
    string Origin,
    string Destination,
    VehicleType RequestedVehicleType,
    Guid? DriverId,
    RideStatus Status);
