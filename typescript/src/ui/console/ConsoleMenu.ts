import { createInterface } from "node:readline/promises";
import type { IRideService } from "../../business/abstracts/IRideService.js";
import { BusinessError } from "../../business/errors/BusinessError.js";
import type { Ride } from "../../entities/Ride.js";

export class ConsoleMenu {
  private readonly input = createInterface({ input: process.stdin, output: process.stdout });

  constructor(private readonly rideService: IRideService) {}

  async run(): Promise<void> {
    try {
      while (true) {
        console.log("\n======================================================");
        console.log("\n===   Urban Mobility / Layered Architecture Demo   ===");
        console.log("\n======================================================");
        console.log("1. List drivers");
        console.log("2. Request a ride");
        console.log("3. List rides");
        console.log("4. Accept a ride");
        console.log("5. Start a ride");
        console.log("6. Complete a ride");
        console.log("0. Exit");
        const choice = await this.ask("Choose an option: ");
        if (choice === "0") {
          return;
        }

        try {
          switch (choice) {
            case "1":
              this.listDrivers();
              break;
            case "2":
              await this.requestRide();
              break;
            case "3":
              this.listRides();
              break;
            case "4":
              await this.acceptRide();
              break;
            case "5":
              await this.changeRideState("Ride ID to start: ", (id) =>
                this.rideService.startRide(this.parseId(id, "INVALID_RIDE_ID")),
              );
              break;
            case "6":
              await this.changeRideState("Ride ID to complete: ", (id) =>
                this.rideService.completeRide(this.parseId(id, "INVALID_RIDE_ID")),
              );
              break;
            default:
              console.log("Choose a number from 0 to 6.");
          }
        } catch (error) {
          if (error instanceof BusinessError) {
            console.log(`${error.code}: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    } finally {
      this.input.close();
    }
  }

  private listDrivers(): void {
    for (const driver of this.rideService.getDrivers()) {
      console.log(
        `${driver.id} | ${driver.name} | ${driver.vehicleType} | ${
          driver.isAvailable ? "Available" : "Busy"
        }`,
      );
    }
  }

  private async requestRide(): Promise<void> {
    const origin = await this.ask("Origin: ");
    const destination = await this.ask("Destination: ");
    const vehicleType = await this.ask("Vehicle type (Car or Motorcycle): ");
    if (vehicleType !== "Car" && vehicleType !== "Motorcycle") {
      console.log("INVALID_VEHICLE_TYPE: Choose Car or Motorcycle.");
      return;
    }

    const ride = this.rideService.createRide(origin, destination, vehicleType);
    console.log(`Ride ${ride.id}: ${ride.status}`);
  }

  private listRides(): void {
    for (const ride of this.rideService.getRides()) {
      console.log(
        `${ride.id} | ${ride.origin} -> ${ride.destination} | ${ride.requestedVehicleType} | ` +
          `${ride.status} | Driver: ${ride.driverId ?? "None"}`,
      );
    }
  }

  private async acceptRide(): Promise<void> {
    const rideId = this.parseId(await this.ask("Ride ID to accept: "), "INVALID_RIDE_ID");
    const driverId = this.parseId(await this.ask("Driver ID: "), "INVALID_DRIVER_ID");
    this.printTransition(this.rideService.acceptRide(rideId, driverId));
  }

  private async changeRideState(
    prompt: string,
    changeState: (id: string) => Ride,
  ): Promise<void> {
    const rideId = await this.ask(prompt);
    this.printTransition(changeState(rideId));
  }

  private printTransition(ride: Ride): void {
    console.log(`Ride ${ride.id} is now ${ride.status}; driver: ${ride.driverId ?? "None"}.`);
  }

  private async ask(question: string): Promise<string> {
    const answer = await this.input.question(question);
    return answer.trim();
  }

  private parseId(value: string, code: string): string {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return value;
    }
    throw new BusinessError(code, "ID must be a valid UUID", "BadRequest");
  }
}
