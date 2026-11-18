import type { Driver } from "../entities/Driver.js";
import { randomUUID } from "node:crypto";
import type { IDriverRepository } from "../business/abstracts/IDriverRepository.js";

export function seedDrivers(repository: IDriverRepository): Driver[] {
  const drivers: Driver[] = [
    { id: randomUUID(), name: "Obi-Wan Kenobi", vehicleType: "Car", isAvailable: true },
    { id: randomUUID(), name: "Anakin Skywalker", vehicleType: "Car", isAvailable: true },
    { id: randomUUID(), name: "Qui-Gon Jinn", vehicleType: "Car", isAvailable: true },
    { id: randomUUID(), name: "Ahsoka Tano", vehicleType: "Car", isAvailable: true },
    { id: randomUUID(), name: "Mace Windu", vehicleType: "Motorcycle", isAvailable: true },
    { id: randomUUID(), name: "Ki-Adi-Mundi", vehicleType: "Motorcycle", isAvailable: true },
  ];

  for (const driver of drivers) {
    repository.save(driver);
  }

  return drivers;
}
