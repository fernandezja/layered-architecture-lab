import { RideService } from "../business/services/RideService.js";
import { InMemoryDriverRepository } from "../data/InMemoryDriverRepository.js";
import { InMemoryRideRepository } from "../data/InMemoryRideRepository.js";
import { seedDrivers } from "../data/seedDrivers.js";

export function createDemoApplication() {
  const driverRepository = new InMemoryDriverRepository();
  const drivers = seedDrivers(driverRepository);
  const rideService = new RideService(new InMemoryRideRepository(), driverRepository);
  return { rideService, drivers };
}
