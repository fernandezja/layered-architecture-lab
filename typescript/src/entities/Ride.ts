import type { RideStatus } from "./RideStatus.js";
import type { VehicleType } from "./VehicleType.js";

export interface Ride {
  readonly id: string;
  readonly origin: string;
  readonly destination: string;
  readonly requestedVehicleType: VehicleType;
  readonly driverId: string | null;
  readonly status: RideStatus;
}
