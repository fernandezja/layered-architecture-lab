import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { BusinessError } from "../../src/business/errors/BusinessError.js";
import { RideService } from "../../src/business/services/RideService.js";
import { InMemoryDriverRepository } from "../../src/data/InMemoryDriverRepository.js";
import { InMemoryRideRepository } from "../../src/data/InMemoryRideRepository.js";

describe("RideService", () => {
  let service: RideService;
  let otherService: RideService;
  let carDriverId: string;
  let motorcycleDriverId: string;

  beforeEach(() => {
    const drivers = new InMemoryDriverRepository();
    const rides = new InMemoryRideRepository();
    carDriverId = randomUUID();
    motorcycleDriverId = randomUUID();
    drivers.save({ id: carDriverId, name: "Car Driver", vehicleType: "Car", isAvailable: true });
    drivers.save({
      id: motorcycleDriverId,
      name: "Motorcycle Driver",
      vehicleType: "Motorcycle",
      isAvailable: true,
    });
    service = new RideService(rides, drivers);
    otherService = new RideService(new InMemoryRideRepository(), new InMemoryDriverRepository());
  });

  it("creates a valid ride with Requested status and no driver", () => {
    const ride = service.createRide("Campus", "Downtown", "Motorcycle");
    expect(ride.status).toBe("Requested");
    expect(ride.driverId).toBeNull();
  });

  it("rejects an empty origin", () => {
    expect(() => service.createRide(" ", "Downtown", "Car")).toThrowError(
      expect.objectContaining({ code: "INVALID_ORIGIN" }),
    );
  });

  it("rejects equal locations ignoring case and whitespace", () => {
    expect(() => service.createRide(" Campus ", "campus", "Car")).toThrowError(
      expect.objectContaining({ code: "SAME_LOCATION" }),
    );
  });

  it("accepts a ride with a matching available driver", () => {
    const ride = service.createRide("Campus", "Downtown", "Motorcycle");
    const accepted = service.acceptRide(ride.id, motorcycleDriverId);
    expect(accepted.status).toBe("Accepted");
    expect(accepted.driverId).toBe(motorcycleDriverId);
    expect(service.getDrivers().find((driver) => driver.id === motorcycleDriverId)?.isAvailable).toBe(false);
  });

  it("rejects a driver with a different vehicle type", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    expect(() => service.acceptRide(ride.id, motorcycleDriverId)).toThrowError(
      expect.objectContaining({ code: "VEHICLE_TYPE_MISMATCH" }),
    );
  });

  it("rejects an unavailable driver", () => {
    const firstRide = service.createRide("Campus", "Downtown", "Car");
    const secondRide = service.createRide("North", "South", "Car");
    service.acceptRide(firstRide.id, carDriverId);
    expect(() => service.acceptRide(secondRide.id, carDriverId)).toThrowError(
      expect.objectContaining({ code: "DRIVER_UNAVAILABLE" }),
    );
  });

  it("rejects an already accepted ride", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    service.acceptRide(ride.id, carDriverId);
    expect(() => service.acceptRide(ride.id, carDriverId)).toThrowError(
      expect.objectContaining({ code: "RIDE_NOT_REQUESTED" }),
    );
  });

  it("rejects starting a requested ride", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    expect(() => service.startRide(ride.id)).toThrowError(
      expect.objectContaining({ code: "RIDE_NOT_ACCEPTED" }),
    );
  });

  it("starts an accepted ride", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    service.acceptRide(ride.id, carDriverId);
    expect(service.startRide(ride.id).status).toBe("InProgress");
  });

  it("rejects completing a ride before it is in progress", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    expect(() => service.completeRide(ride.id)).toThrowError(
      expect.objectContaining({ code: "RIDE_NOT_IN_PROGRESS" }),
    );
  });

  it("completes an in-progress ride and releases its driver", () => {
    const ride = service.createRide("Campus", "Downtown", "Car");
    service.acceptRide(ride.id, carDriverId);
    service.startRide(ride.id);
    expect(service.completeRide(ride.id).status).toBe("Completed");
    expect(service.getDrivers().find((driver) => driver.id === carDriverId)?.isAvailable).toBe(true);
  });

  it("classifies an unknown ride as not found", () => {
    try {
      service.getRide(randomUUID());
      throw new Error("Expected an unknown ride to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(BusinessError);
      expect(error).toMatchObject({ code: "RIDE_NOT_FOUND", kind: "NotFound" });
    }
  });

  it("does not allow two rides to use the same driver at once", () => {
    const firstRide = service.createRide("Campus", "Downtown", "Car");
    const secondRide = service.createRide("North", "South", "Car");
    service.acceptRide(firstRide.id, carDriverId);
    expect(() => service.acceptRide(secondRide.id, carDriverId)).toThrowError(
      expect.objectContaining({ code: "DRIVER_UNAVAILABLE" }),
    );
  });

  it("does not share rides between different repository instances", () => {
    service.createRide("Campus", "Downtown", "Car");
    expect(otherService.getRides()).toEqual([]);
  });
});
