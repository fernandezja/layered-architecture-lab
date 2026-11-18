using Mobility.Entities;
using Mobility.Data;
using Xunit;

namespace Mobility.Business.Tests;

public sealed class InMemoryRepositoryTests
{
    [Fact]
    public void ReturnedRideListCannotChangeStoredRepositoryContents()
    {
        var repository = new InMemoryRideRepository();
        var ride = new Ride(
            Guid.NewGuid(),
            "Campus",
            "Downtown",
            VehicleType.CAR,
            null,
            RideStatus.REQUESTED);
        repository.Save(ride);

        var returnedRides = Assert.IsType<Ride[]>(repository.GetAll());
        returnedRides[0] = ride with { Origin = "Changed by caller" };

        Assert.Equal("Campus", repository.GetById(ride.Id)?.Origin);
    }

    [Fact]
    public void DifferentRepositoryInstancesDoNotShareDrivers()
    {
        var first = new InMemoryDriverRepository();
        var second = new InMemoryDriverRepository();
        first.Save(new Driver(Guid.NewGuid(), "Alex", VehicleType.CAR, true));

        Assert.Empty(second.GetAll());
    }
}
