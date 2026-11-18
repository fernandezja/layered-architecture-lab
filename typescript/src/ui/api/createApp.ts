import express from "express";
import { apiReference } from "@scalar/express-api-reference";
import type { IRideService } from "../../business/abstracts/IRideService.js";
import { BusinessError } from "../../business/errors/BusinessError.js";
import { MobilityRoutes } from "./MobilityRoutes.js";
import { OpenApiDocument } from "./OpenApiDocument.js";

export function createApp(rideService: IRideService) {
  const app = express();
  app.use(express.json());
  app.get("/openapi.json", (_request, response) => {
    response.json(OpenApiDocument);
  });
  app.use("/scalar", apiReference({ url: "/openapi.json" }));
  app.use(new MobilityRoutes(rideService).getRouter());

  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (!(error instanceof BusinessError)) {
      next(error);
      return;
    }

    const status = error.kind === "BadRequest" ? 400 : error.kind === "NotFound" ? 404 : 409;
    response.status(status).json({ code: error.code, message: error.message });
  });

  return app;
}
