import { createDemoApplication } from "../../composition/createDemoApplication.js";
import { createApp } from "./createApp.js";

async function ApiServer(): Promise<void> {
  const { rideService, drivers } = createDemoApplication();
  const port = 5081;
  const app = createApp(rideService);

  console.log("Urban Mobility API uses in-memory data; restart to reset. Console and API data are separate.");
  console.log(`Listening at http://localhost:${port}. Seeded drivers:`);
  for (const driver of drivers) {
    console.log(`  ${driver.name} (${driver.vehicleType}) - ${driver.id}`);
  }

  app.listen(port);
}

await ApiServer();
