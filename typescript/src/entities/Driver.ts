import type { VehicleType } from "./VehicleType.js";

export interface Driver {
  readonly id: string;
  readonly name: string;
  readonly vehicleType: VehicleType;
  readonly isAvailable: boolean;
}
