import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { InMemoryDriverRepository } from "../../src/data/InMemoryDriverRepository.js";
import { InMemoryRideRepository } from "../../src/data/InMemoryRideRepository.js";

describe("in-memory repositories", () => {
  it("returns copies instead of stored driver objects", () => {
    const repository = new InMemoryDriverRepository();
    const driver = { id: randomUUID(), name: "Alex", vehicleType: "Car" as const, isAvailable: true };
    repository.save(driver);
    const copy = repository.getById(driver.id)!;

    expect(copy).not.toBe(driver);
    expect(repository.getAll()[0]).not.toBe(copy);
  });

  it("keeps repository instances isolated", () => {
    const first = new InMemoryRideRepository();
    const second = new InMemoryRideRepository();
    first.save({
      id: randomUUID(),
      origin: "Campus",
      destination: "Downtown",
      requestedVehicleType: "Car",
      driverId: null,
      status: "Requested",
    });

    expect(second.getAll()).toEqual([]);
  });
});
