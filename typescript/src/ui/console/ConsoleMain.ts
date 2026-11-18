import { createDemoApplication } from "../../composition/createDemoApplication.js";
import { ConsoleMenu } from "./ConsoleMenu.js";

async function ConsoleMain(): Promise<void> {
  const { rideService, drivers } = createDemoApplication();
  console.log("This demo uses in-memory data. Restarting resets rides and drivers.");
  console.log("Each Console or API process has its own separate data.");
  console.log("Seeded drivers:");
  for (const driver of drivers) {
    console.log(`  ${driver.name} (${driver.vehicleType}) - ${driver.id}`);
  }

  await new ConsoleMenu(rideService).run();
}

await ConsoleMain();
