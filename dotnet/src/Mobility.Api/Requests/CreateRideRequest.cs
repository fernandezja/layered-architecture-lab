namespace Mobility.Api.Requests;

public sealed record CreateRideRequest(string? Origin, string? Destination, string? VehicleType);
