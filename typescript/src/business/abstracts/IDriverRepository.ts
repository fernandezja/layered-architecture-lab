import type { Driver } from "../../entities/Driver.js";

export interface IDriverRepository {
  getAll(): Driver[];
  getById(id: string): Driver | undefined;
  save(driver: Driver): void;
}
