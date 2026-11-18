using Mobility.Entities;

namespace Mobility.Business.Abstractions;

public interface IRideService
{
    Ride AcceptRide(Guid rideId, Guid driverId);
    Ride CompleteRide(Guid rideId);
    Ride CreateRide(string origin, string destination, VehicleType vehicleType);
    IReadOnlyList<Driver> GetDrivers();
    Ride GetRide(Guid id);
    IReadOnlyList<Ride> GetRides();
    Ride StartRide(Guid rideId);
}
