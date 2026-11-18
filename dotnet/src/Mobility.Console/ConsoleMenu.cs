using Mobility.Business.Errors;
using Mobility.Entities;
using Mobility.Business.Services;

internal sealed class ConsoleMenu(RideService rideService)
{
    public void Run()
    {
        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("======================================================");
            Console.WriteLine("===    Urban Mobility / Layered Architecture Lab   ===");
            Console.WriteLine("======================================================");
            Console.WriteLine("1. List drivers");
            Console.WriteLine("2. Request a ride");
            Console.WriteLine("3. List rides");
            Console.WriteLine("4. Accept a ride");
            Console.WriteLine("5. Start a ride");
            Console.WriteLine("6. Complete a ride");
            Console.WriteLine("0. Exit");
            Console.Write("Choose an option: ");


            var choice = Console.ReadLine();

            if (choice == "0")
            {
                return;
            }

            try
            {
                switch (choice)
                {
                    case "1":
                        ListDrivers();
                        break;
                    case "2":
                        RequestRide();
                        break;
                    case "3":
                        ListRides();
                        break;
                    case "4":
                        AcceptRide();
                        break;
                    case "5":
                        ChangeRideState(
                            "Ride ID to start: ",
                            id => rideService.StartRide(ParseId(id, "INVALID_RIDE_ID")));
                        break;
                    case "6":
                        ChangeRideState(
                            "Ride ID to complete: ",
                            id => rideService.CompleteRide(ParseId(id, "INVALID_RIDE_ID")));
                        break;
                    default:
                        Console.WriteLine("Choose a number from 0 to 6.");
                        break;
                }
            }
            catch (BusinessException error)
            {
                Console.WriteLine($"{error.Code}: {error.Message}");
            }
        }
    }

    private void ListDrivers()
    {
        foreach (var driver in rideService.GetDrivers())
        {
            Console.WriteLine(
                $"{driver.Id} | {driver.Name} | {driver.VehicleType} | " +
                $"{(driver.IsAvailable ? "Available" : "Busy")}");
        }
    }

    private void RequestRide()
    {
        Console.Write("Origin: ");
        var origin = Console.ReadLine() ?? string.Empty;
        Console.Write("Destination: ");
        var destination = Console.ReadLine() ?? string.Empty;
        Console.Write("Vehicle type (CAR or MOTORCYCLE): ");
        var vehicleText = Console.ReadLine();
        if (!Enum.TryParse<VehicleType>(vehicleText, true, out var vehicleType) ||
            !Enum.IsDefined(vehicleType))
        {
            Console.WriteLine("INVALID_VEHICLE_TYPE: Choose CAR or MOTORCYCLE.");
            return;
        }

        var ride = rideService.CreateRide(origin, destination, vehicleType);
        Console.WriteLine($"Ride {ride.Id}: {ride.Status}");
    }

    private void ListRides()
    {
        foreach (var ride in rideService.GetRides())
        {
            Console.WriteLine(
                $"{ride.Id} | {ride.Origin} -> {ride.Destination} | " +
                $"{ride.RequestedVehicleType} | {ride.Status} | Driver: {ride.DriverId}");
        }
    }

    private void AcceptRide()
    {
        Console.Write("Ride ID to accept: ");
        var rideId = ParseId(Console.ReadLine(), "INVALID_RIDE_ID");
        Console.Write("Driver ID: ");
        var driverId = ParseId(Console.ReadLine(), "INVALID_DRIVER_ID");
        PrintTransition(rideService.AcceptRide(rideId, driverId));
    }

    private void ChangeRideState(string prompt, Func<string, Ride> changeState)
    {
        Console.Write(prompt);
        var rideId = Console.ReadLine() ?? string.Empty;
        PrintTransition(changeState(rideId));
    }

    private static Guid ParseId(string? value, string errorCode)
    {
        if (Guid.TryParse(value, out var id))
        {
            return id;
        }

        throw new BusinessException(errorCode, "ID must be a valid GUID", BusinessErrorKind.BadRequest);
    }

    private static void PrintTransition(Ride ride) =>
        Console.WriteLine($"Ride {ride.Id} is now {ride.Status}; driver: {ride.DriverId}.");
}
