using Mobility.Business.Services;
using Mobility.Data;

var driverRepository = new InMemoryDriverRepository();
var drivers = DemoDataSeeder.SeedDrivers(driverRepository);
var rideService = new RideService(new InMemoryRideRepository(), driverRepository);

Console.WriteLine("This demo uses in-memory data. Restarting resets rides and drivers.");
Console.WriteLine("Each Console or API process has its own separate data.");
Console.WriteLine("Seeded drivers:");
foreach (var driver in drivers)
{
    Console.WriteLine($"  {driver.Name} ({driver.VehicleType}) - {driver.Id}");
}

new ConsoleMenu(rideService).Run();
