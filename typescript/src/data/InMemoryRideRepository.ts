import type { Ride } from "../entities/Ride.js";
import type { IRideRepository } from "../business/abstracts/IRideRepository.js";

export class InMemoryRideRepository implements IRideRepository {
  private readonly rides = new Map<string, Ride>();

  getAll(): Ride[] {
    return Array.from(this.rides.values(), (ride) => ({ ...ride }));
  }

  getById(id: string): Ride | undefined {
    const ride = this.rides.get(id);
    return ride ? { ...ride } : undefined;
  }

  save(ride: Ride): void {
    this.rides.set(ride.id, { ...ride });
  }
}
