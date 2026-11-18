import { Router } from "express";
import type { IRideService } from "../../business/abstracts/IRideService.js";
import { BusinessError } from "../../business/errors/BusinessError.js";
import type { VehicleType } from "../../entities/VehicleType.js";

export class MobilityRoutes {
  private readonly router = Router();

  constructor(private readonly rideService: IRideService) {
    this.registerRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  private registerRoutes(): void {
    this.router.get("/health", (_request, response) => {
      response.json({ status: "ok", message: "In-memory data resets when this process stops." });
    });
    this.router.get("/api/drivers", (_request, response) => {
      response.json(this.rideService.getDrivers());
    });
    this.router.get("/api/rides", (_request, response) => {
      response.json(this.rideService.getRides());
    });
    this.router.get("/api/rides/:id", (request, response) => {
      response.json(this.rideService.getRide(this.parseRideId(request.params.id)));
    });
    this.router.post("/api/rides", (request, response) => {
      const body: unknown = request.body;
      if (!this.isObject(body)) {
        throw new BusinessError("INVALID_REQUEST", "Request body must be an object", "BadRequest");
      }

      const vehicleType = this.parseVehicleType(body.vehicleType);
      const ride = this.rideService.createRide(
        typeof body.origin === "string" ? body.origin : "",
        typeof body.destination === "string" ? body.destination : "",
        vehicleType,
      );
      response.location(`/api/rides/${ride.id}`).status(201).json(ride);
    });
    this.router.post("/api/rides/:id/accept", (request, response) => {
      const rideId = this.parseRideId(request.params.id);
      const body: unknown = request.body;
      const driverId = this.isObject(body) ? body.driverId : undefined;
      if (typeof driverId !== "string" || !this.isUuid(driverId)) {
        throw new BusinessError("INVALID_DRIVER_ID", "Driver ID must be a valid UUID", "BadRequest");
      }
      response.json(this.rideService.acceptRide(rideId, driverId));
    });
    this.router.post("/api/rides/:id/start", (request, response) => {
      response.json(this.rideService.startRide(this.parseRideId(request.params.id)));
    });
    this.router.post("/api/rides/:id/complete", (request, response) => {
      response.json(this.rideService.completeRide(this.parseRideId(request.params.id)));
    });
  }

  private parseVehicleType(value: unknown): VehicleType {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "car") {
        return "Car";
      }
      if (normalized === "motorcycle") {
        return "Motorcycle";
      }
    }
    throw new BusinessError("INVALID_VEHICLE_TYPE", "Vehicle type must be Car or Motorcycle", "BadRequest");
  }

  private parseRideId(value: string): string {
    if (this.isUuid(value)) {
      return value;
    }
    throw new BusinessError("INVALID_RIDE_ID", "Ride ID must be a valid UUID", "BadRequest");
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
