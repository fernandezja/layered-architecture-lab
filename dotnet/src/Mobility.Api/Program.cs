using System.Text.Json.Serialization;
using Mobility.Api.Requests;
using Mobility.Api.Responses;
using Mobility.Data.Abstractions;
using Mobility.Business.Abstractions;
using Mobility.Business.Errors;
using Mobility.Business.Services;
using Mobility.Data;
using Mobility.Entities;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5080");

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        foreach (var server in document.Servers ?? [])
        {
            if (!string.IsNullOrEmpty(server.Url))
            {
                // Scalar concatenates the server URL with paths that start with '/'.
                server.Url = server.Url.TrimEnd('/');
            }
        }

        return Task.CompletedTask;
    });
});

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var driverRepository = new InMemoryDriverRepository();

var seededDrivers = DemoDataSeeder.SeedDrivers(driverRepository);

builder.Services.AddSingleton<IDriverRepository>(driverRepository);
builder.Services.AddSingleton<IRideRepository, InMemoryRideRepository>();
builder.Services.AddSingleton<RideService>();

var app = builder.Build();
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (BusinessException error)
    {
        context.Response.StatusCode = error.Kind switch
        {
            BusinessErrorKind.BadRequest => StatusCodes.Status400BadRequest,
            BusinessErrorKind.NotFound => StatusCodes.Status404NotFound,
            BusinessErrorKind.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };
        await context.Response.WriteAsJsonAsync(new ApiError(error.Code, error.Message));
    }
});

app.MapOpenApi();

app.MapScalarApiReference();

app.MapGet("/health", () =>
    Results.Ok(new { status = "ok", message = "In-memory data resets when this process stops." }));

app.MapGet("/api/drivers", (RideService rideService) => Results.Ok(rideService.GetDrivers()));

app.MapGet("/api/rides", (RideService rideService) => Results.Ok(rideService.GetRides()));

app.MapGet("/api/rides/{id}", (string id, RideService rideService) =>
    Results.Ok(rideService.GetRide(ParseId(id, "INVALID_RIDE_ID"))));

app.MapPost("/api/rides", (CreateRideRequest request, 
                            RideService rideService) =>
{
    if (!Enum.TryParse<VehicleType>(request.VehicleType, true, out var vehicleType) 
        || !Enum.IsDefined(vehicleType))
    {
        throw new BusinessException(
            "INVALID_VEHICLE_TYPE",
            "Vehicle type must be CAR or MOTORCYCLE",
            BusinessErrorKind.BadRequest);
    }

    var ride = rideService.CreateRide(
        request.Origin ?? string.Empty,
        request.Destination ?? string.Empty,
        vehicleType);

    return Results.Created($"/api/rides/{ride.Id}", ride);
});

app.MapPost("/api/rides/{id}/accept", (string id, 
                                       AcceptRideRequest request, 
                                       RideService rideService) =>
{
    var rideId = ParseId(id, "INVALID_RIDE_ID");
    var driverId = ParseId(request.DriverId, "INVALID_DRIVER_ID");
    return Results.Ok(rideService.AcceptRide(rideId, driverId));
});

app.MapPost("/api/rides/{id}/start", (string id, RideService rideService) =>
    Results.Ok(rideService.StartRide(ParseId(id, "INVALID_RIDE_ID"))));

app.MapPost("/api/rides/{id}/complete", (string id, RideService rideService) =>
    Results.Ok(rideService.CompleteRide(ParseId(id, "INVALID_RIDE_ID"))));


Console.WriteLine("Urban Mobility API uses in-memory data; restart to reset. Console and API data are separate.");
Console.WriteLine($"Listening at http://localhost:5080. Seeded drivers:");

foreach (var driver in seededDrivers)
{
    Console.WriteLine($"  {driver.Name} ({driver.VehicleType}) - {driver.Id}");
}

app.Run();

static Guid ParseId(string? value, string errorCode)
{
    if (Guid.TryParse(value, out var id))
    {
        return id;
    }

    throw new BusinessException(errorCode, "ID must be a valid GUID", BusinessErrorKind.BadRequest);
}
