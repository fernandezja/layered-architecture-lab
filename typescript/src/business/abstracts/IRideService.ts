import type { Driver } from "../../entities/Driver.js";
import type { Ride } from "../../entities/Ride.js";
import type { VehicleType } from "../../entities/VehicleType.js";

export interface IRideService {
  createRide(origin: string, destination: string, vehicleType: VehicleType): Ride;
  getRides(): Ride[];
  getRide(id: string): Ride;
  getDrivers(): Driver[];
  acceptRide(rideId: string, driverId: string): Ride;
  startRide(rideId: string): Ride;
  completeRide(rideId: string): Ride;
}
