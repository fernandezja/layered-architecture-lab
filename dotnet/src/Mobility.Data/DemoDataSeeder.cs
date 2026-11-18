using Mobility.Entities;

namespace Mobility.Data;

public static class DemoDataSeeder
{
    public static IReadOnlyList<Driver> SeedDrivers(InMemoryDriverRepository repository)
    {
        Driver[] drivers =
        [
            new(Guid.NewGuid(), "Obi-Wan Kenobi", VehicleType.CAR, true),
            new(Guid.NewGuid(), "Anakin Skywalker", VehicleType.CAR, true),
            new(Guid.NewGuid(), "Qui-Gon Jinn", VehicleType.CAR, true),
            new(Guid.NewGuid(), "Ahsoka Tano", VehicleType.CAR, true),
            new(Guid.NewGuid(), "Mace Windu", VehicleType.MOTORCYCLE, true),
            new(Guid.NewGuid(), "Ki-Adi-Mundi", VehicleType.MOTORCYCLE, true)
        ];

        foreach (var driver in drivers)
        {
            repository.Save(driver);
        }

        return drivers;
    }
}
