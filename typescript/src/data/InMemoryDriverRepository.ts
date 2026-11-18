import type { Driver } from "../entities/Driver.js";
import type { IDriverRepository } from "../business/abstracts/IDriverRepository.js";

export class InMemoryDriverRepository implements IDriverRepository {
  private readonly drivers = new Map<string, Driver>();

  getAll(): Driver[] {
    return Array.from(this.drivers.values(), (driver) => ({ ...driver }));
  }

  getById(id: string): Driver | undefined {
    const driver = this.drivers.get(id);
    return driver ? { ...driver } : undefined;
  }

  save(driver: Driver): void {
    this.drivers.set(driver.id, { ...driver });
  }
}
