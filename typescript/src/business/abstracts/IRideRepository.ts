import type { Ride } from "../../entities/Ride.js";

export interface IRideRepository {
  getAll(): Ride[];
  getById(id: string): Ride | undefined;
  save(ride: Ride): void;
}
