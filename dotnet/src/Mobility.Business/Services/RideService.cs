using Mobility.Data.Abstractions;
using Mobility.Business.Abstractions;
using Mobility.Business.Errors;
using Mobility.Entities;

namespace Mobility.Business.Services;

public sealed class RideService(IRideRepository rideRepository,
                                IDriverRepository driverRepository) : IRideService
{

    //public RideService(IRideRepository rideRepository,
    //                   IDriverRepository driverRepository)
    //{
    //  _rideRepository = rideRepository;
    //  _driverRepository = driverRepository;
    //}

    public Ride CreateRide(string origin,
                           string destination,
                           VehicleType vehicleType)
    {

        if (string.IsNullOrWhiteSpace(origin))
        {
            throw BadRequest("INVALID_ORIGIN", "Origin is required");
        }

        if (string.IsNullOrWhiteSpace(destination))
        {
            throw BadRequest("INVALID_DESTINATION", "Destination is required");
        }

        if (!Enum.IsDefined(vehicleType))
        {
            throw BadRequest("INVALID_VEHICLE_TYPE", "Vehicle type is not supported");
        }

        var cleanOrigin = origin.Trim();
        var cleanDestination = destination.Trim();

        if (string.Equals(cleanOrigin, cleanDestination, StringComparison.OrdinalIgnoreCase))
        {
            throw BadRequest("SAME_LOCATION", "Origin and destination must be different");
        }

        var ride = new Ride(
            Guid.NewGuid(),
            cleanOrigin,
            cleanDestination,
            vehicleType,
            null,
            RideStatus.REQUESTED);

        rideRepository.Save(ride);

        return ride;
    }


    public IReadOnlyList<Ride> GetRides()
    {
        return rideRepository.GetAll();
    }


    public Ride GetRide(Guid id)
    {
        return rideRepository.GetById(id) ?? throw NotFound("RIDE_NOT_FOUND", "Ride was not found");
    }


    public IReadOnlyList<Driver> GetDrivers()
    {
        return driverRepository.GetAll();
    }


    public Ride AcceptRide(Guid rideId, Guid driverId)
    {
        var ride = GetRide(rideId);
        var driver = driverRepository.GetById(driverId)
            ?? throw NotFound("DRIVER_NOT_FOUND", "Driver was not found");

        if (ride.Status != RideStatus.REQUESTED)
        {
            throw Conflict("RIDE_NOT_REQUESTED", "Only a requested ride can be accepted");
        }

        if (!driver.IsAvailable)
        {
            throw Conflict("DRIVER_UNAVAILABLE", "Driver is not available");
        }

        if (driver.VehicleType != ride.RequestedVehicleType)
        {
            throw Conflict("VEHICLE_TYPE_MISMATCH", "Driver vehicle type does not match the ride");
        }

        var acceptedRide = ride with
        {
            DriverId = driver.Id,
            Status = RideStatus.ACCEPTED
        };

        rideRepository.Save(acceptedRide);
        driverRepository.Save(driver with { IsAvailable = false });
        return acceptedRide;
    }


    public Ride StartRide(Guid rideId)
    {
        var ride = GetRide(rideId);
        if (ride.Status != RideStatus.ACCEPTED)
        {
            throw Conflict("RIDE_NOT_ACCEPTED", "Only an accepted ride can be started");
        }

        var startedRide = ride with { Status = RideStatus.IN_PROGRESS };
        rideRepository.Save(startedRide);
        return startedRide;
    }


    public Ride CompleteRide(Guid rideId)
    {
        var ride = GetRide(rideId);
        if (ride.Status != RideStatus.IN_PROGRESS)
        {
            throw Conflict("RIDE_NOT_IN_PROGRESS", "Only an in-progress ride can be completed");
        }

        var driver = driverRepository.GetById(ride.DriverId!.Value)
            ?? throw NotFound("DRIVER_NOT_FOUND", "Driver was not found");

        var completedRide = ride with { Status = RideStatus.COMPLETED };
        
        rideRepository.Save(completedRide);
        
        driverRepository.Save(driver with { IsAvailable = true });
        
        return completedRide;
    }


    private static BusinessException BadRequest(string code, string message) =>
        new(code, message, BusinessErrorKind.BadRequest);


    private static BusinessException NotFound(string code, string message) =>
        new(code, message, BusinessErrorKind.NotFound);


    private static BusinessException Conflict(string code, string message) =>
        new(code, message, BusinessErrorKind.Conflict);
}
