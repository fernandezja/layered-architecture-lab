import { randomUUID } from "node:crypto";
import type { IDriverRepository } from "../abstracts/IDriverRepository.js";
import type { IRideRepository } from "../abstracts/IRideRepository.js";
import type { IRideService } from "../abstracts/IRideService.js";
import { BusinessError } from "../errors/BusinessError.js";
import type { Driver } from "../../entities/Driver.js";
import type { Ride } from "../../entities/Ride.js";
import type { VehicleType } from "../../entities/VehicleType.js";

export class RideService implements IRideService {
  constructor(
    private readonly rides: IRideRepository,
    private readonly drivers: IDriverRepository,
  ) {}

  createRide(origin: string, destination: string, vehicleType: VehicleType): Ride {
    if (!origin.trim()) {
      throw new BusinessError("INVALID_ORIGIN", "Origin is required", "BadRequest");
    }

    if (!destination.trim()) {
      throw new BusinessError("INVALID_DESTINATION", "Destination is required", "BadRequest");
    }

    if (vehicleType !== "Car" && vehicleType !== "Motorcycle") {
      throw new BusinessError("INVALID_VEHICLE_TYPE", "Vehicle type is not supported", "BadRequest");
    }

    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();
    if (cleanOrigin.toLowerCase() === cleanDestination.toLowerCase()) {
      throw new BusinessError("SAME_LOCATION", "Origin and destination must be different", "BadRequest");
    }

    const ride: Ride = {
      id: randomUUID(),
      origin: cleanOrigin,
      destination: cleanDestination,
      requestedVehicleType: vehicleType,
      driverId: null,
      status: "Requested",
    };
    this.rides.save(ride);
    return ride;
  }

  getRides(): Ride[] {
    return this.rides.getAll();
  }

  getRide(id: string): Ride {
    const ride = this.rides.getById(id);
    if (!ride) {
      throw new BusinessError("RIDE_NOT_FOUND", "Ride was not found", "NotFound");
    }
    return ride;
  }

  getDrivers(): Driver[] {
    return this.drivers.getAll();
  }

  acceptRide(rideId: string, driverId: string): Ride {
    const ride = this.getRide(rideId);
    const driver = this.drivers.getById(driverId);
    if (!driver) {
      throw new BusinessError("DRIVER_NOT_FOUND", "Driver was not found", "NotFound");
    }

    if (ride.status !== "Requested") {
      throw new BusinessError("RIDE_NOT_REQUESTED", "Only a requested ride can be accepted", "Conflict");
    }

    if (!driver.isAvailable) {
      throw new BusinessError("DRIVER_UNAVAILABLE", "Driver is not available", "Conflict");
    }

    if (driver.vehicleType !== ride.requestedVehicleType) {
      throw new BusinessError("VEHICLE_TYPE_MISMATCH", "Driver vehicle type does not match the ride", "Conflict");
    }

    const acceptedRide: Ride = { ...ride, driverId: driver.id, status: "Accepted" };
    this.rides.save(acceptedRide);
    this.drivers.save({ ...driver, isAvailable: false });
    return acceptedRide;
  }

  startRide(rideId: string): Ride {
    const ride = this.getRide(rideId);
    if (ride.status !== "Accepted") {
      throw new BusinessError("RIDE_NOT_ACCEPTED", "Only an accepted ride can be started", "Conflict");
    }

    const startedRide: Ride = { ...ride, status: "InProgress" };
    this.rides.save(startedRide);
    return startedRide;
  }

  completeRide(rideId: string): Ride {
    const ride = this.getRide(rideId);
    if (ride.status !== "InProgress") {
      throw new BusinessError("RIDE_NOT_IN_PROGRESS", "Only an in-progress ride can be completed", "Conflict");
    }

    const driver = this.drivers.getById(ride.driverId!);
    if (!driver) {
      throw new BusinessError("DRIVER_NOT_FOUND", "Driver was not found", "NotFound");
    }

    const completedRide: Ride = { ...ride, status: "Completed" };
    this.rides.save(completedRide);
    this.drivers.save({ ...driver, isAvailable: true });
    return completedRide;
  }
}
