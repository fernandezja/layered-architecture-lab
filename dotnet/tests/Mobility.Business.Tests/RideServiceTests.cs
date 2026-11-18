using Mobility.Business.Errors;
using Mobility.Entities;
using Mobility.Business.Services;
using Mobility.Data;
using Xunit;

namespace Mobility.Business.Tests;

public sealed class RideServiceTests
{
    private readonly InMemoryRideRepository rides = new();
    private readonly InMemoryDriverRepository drivers = new();
    private readonly RideService service;
    private readonly Driver carDriver;
    private readonly Driver motorcycleDriver;

    public RideServiceTests()
    {
        service = new RideService(rides, drivers);
        carDriver = new Driver(Guid.NewGuid(), "CAR Driver", VehicleType.CAR, true);
        motorcycleDriver = new Driver(Guid.NewGuid(), "MOTORCYCLE Driver", VehicleType.MOTORCYCLE, true);
        drivers.Save(carDriver);
        drivers.Save(motorcycleDriver);
    }


    [Fact]
    public void CreatingValidRideSetsRequestedStatusWithoutDriver()
    {
        var ride = service.CreateRide("Campus", "Downtown", VehicleType.MOTORCYCLE);

        Assert.Equal(RideStatus.REQUESTED, ride.Status);
        Assert.Null(ride.DriverId);
    }


    [Fact]
    public void EmptyOriginFails()
    {
        var error = Assert.Throws<BusinessException>(
            () => service.CreateRide(" ", "Downtown", VehicleType.CAR));

        Assert.Equal("INVALID_ORIGIN", error.Code);
    }


    [Fact]
    public void EqualLocationsFailIgnoringCaseAndWhitespace()
    {
        var error = Assert.Throws<BusinessException>(
            () => service.CreateRide(" Campus ", "campus", VehicleType.CAR));

        Assert.Equal("SAME_LOCATION", error.Code);
    }


    [Fact]
    public void MatchingAvailableDriverCanAcceptRide()
    {
        var ride = NewRide(VehicleType.MOTORCYCLE);

        var accepted = service.AcceptRide(ride.Id, motorcycleDriver.Id);

        Assert.Equal(RideStatus.ACCEPTED, accepted.Status);
        Assert.Equal(motorcycleDriver.Id, accepted.DriverId);
        Assert.False(service.GetDrivers().Single(driver => driver.Id == motorcycleDriver.Id).IsAvailable);
    }


    [Fact]
    public void DifferentVehicleTypeCannotAcceptRide()
    {
        var ride = NewRide(VehicleType.CAR);

        var error = Assert.Throws<BusinessException>(() => service.AcceptRide(ride.Id, motorcycleDriver.Id));

        Assert.Equal("VEHICLE_TYPE_MISMATCH", error.Code);
    }


    [Fact]
    public void UnavailableDriverCannotAcceptRide()
    {
        var firstRide = NewRide(VehicleType.CAR);
        var secondRide = NewRide(VehicleType.CAR);
        service.AcceptRide(firstRide.Id, carDriver.Id);

        var error = Assert.Throws<BusinessException>(() => service.AcceptRide(secondRide.Id, carDriver.Id));

        Assert.Equal("DRIVER_UNAVAILABLE", error.Code);
    }


    [Fact]
    public void AlreadyAcceptedRideCannotBeAcceptedAgain()
    {
        var ride = NewRide(VehicleType.CAR);
        service.AcceptRide(ride.Id, carDriver.Id);

        var error = Assert.Throws<BusinessException>(() => service.AcceptRide(ride.Id, carDriver.Id));

        Assert.Equal("RIDE_NOT_REQUESTED", error.Code);
    }


    [Fact]
    public void RequestedRideCannotBeStarted()
    {
        var ride = NewRide(VehicleType.CAR);

        var error = Assert.Throws<BusinessException>(() => service.StartRide(ride.Id));

        Assert.Equal("RIDE_NOT_ACCEPTED", error.Code);
    }


    [Fact]
    public void AcceptedRideCanBeStarted()
    {
        var ride = NewRide(VehicleType.CAR);
        service.AcceptRide(ride.Id, carDriver.Id);

        var started = service.StartRide(ride.Id);

        Assert.Equal(RideStatus.IN_PROGRESS, started.Status);
    }


    [Fact]
    public void RideCannotBeCompletedBeforeStarting()
    {
        var ride = NewRide(VehicleType.CAR);

        var error = Assert.Throws<BusinessException>(() => service.CompleteRide(ride.Id));

        Assert.Equal("RIDE_NOT_IN_PROGRESS", error.Code);
    }


    [Fact]
    public void CompletingInProgressRideReleasesDriver()
    {
        var ride = NewRide(VehicleType.CAR);
        service.AcceptRide(ride.Id, carDriver.Id);
        service.StartRide(ride.Id);

        var completed = service.CompleteRide(ride.Id);

        Assert.Equal(RideStatus.COMPLETED, completed.Status);
        Assert.True(service.GetDrivers().Single(driver => driver.Id == carDriver.Id).IsAvailable);
    }


    [Fact]
    public void UnknownRideHasNotFoundClassification()
    {
        var error = Assert.Throws<BusinessException>(() => service.GetRide(Guid.NewGuid()));

        Assert.Equal("RIDE_NOT_FOUND", error.Code);
        Assert.Equal(BusinessErrorKind.NotFound, error.Kind);
    }


    [Fact]
    public void DifferentRideRequestsCannotUseSameDriverAtOnce()
    {
        var firstRide = NewRide(VehicleType.CAR);
        var secondRide = NewRide(VehicleType.CAR);
        service.AcceptRide(firstRide.Id, carDriver.Id);

        var error = Assert.Throws<BusinessException>(() => service.AcceptRide(secondRide.Id, carDriver.Id));

        Assert.Equal("DRIVER_UNAVAILABLE", error.Code);
    }


    [Fact]
    public void DifferentRepositoryInstancesDoNotShareData()
    {
        var otherService = new RideService(new InMemoryRideRepository(), new InMemoryDriverRepository());
        service.CreateRide("Campus", "Downtown", VehicleType.CAR);

        Assert.Empty(otherService.GetRides());
    }

    private Ride NewRide(VehicleType type) => service.CreateRide("Campus", "Downtown", type);
}
