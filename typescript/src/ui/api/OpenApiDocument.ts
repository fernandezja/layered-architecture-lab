export const OpenApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Urban Mobility API",
    version: "1.0.0",
    description: "A small ride lifecycle API for learning layered architecture.",
  },
  servers: [{ url: "http://localhost:5081" }],
  paths: {
    "/health": {
      get: {
        summary: "Check API health",
        operationId: "getHealth",
        responses: {
          "200": { description: "The API is running" },
        },
      },
    },
    "/api/drivers": {
      get: {
        summary: "List seeded drivers",
        operationId: "getDrivers",
        responses: {
          "200": {
            description: "Drivers and their availability",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Driver" },
                },
              },
            },
          },
        },
      },
    },
    "/api/rides": {
      get: {
        summary: "List rides",
        operationId: "getRides",
        responses: {
          "200": {
            description: "All rides in this process",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Ride" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Request a ride",
        operationId: "createRide",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRideRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Ride snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ride" },
              },
            },
          },
          "400": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/rides/{id}": {
      get: {
        summary: "Get a ride",
        operationId: "getRide",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Ride snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ride" },
              },
            },
          },
          "400": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/rides/{id}/accept": {
      post: {
        summary: "Accept a requested ride",
        operationId: "acceptRide",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AcceptRideRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Ride snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ride" },
              },
            },
          },
          "400": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/rides/{id}/start": {
      post: {
        summary: "Start an accepted ride",
        operationId: "startRide",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Ride snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ride" },
              },
            },
          },
          "400": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/rides/{id}/complete": {
      post: {
        summary: "Complete an in-progress ride",
        operationId: "completeRide",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Ride snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ride" },
              },
            },
          },
          "400": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": {
            description: "A business rule or input validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Driver: {
        type: "object",
        required: ["id", "name", "vehicleType", "isAvailable"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          vehicleType: { type: "string", enum: ["Car", "Motorcycle"] },
          isAvailable: { type: "boolean" },
        },
      },
      Ride: {
        type: "object",
        required: [
          "id",
          "origin",
          "destination",
          "requestedVehicleType",
          "driverId",
          "status",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          origin: { type: "string" },
          destination: { type: "string" },
          requestedVehicleType: { type: "string", enum: ["Car", "Motorcycle"] },
          driverId: { type: ["string", "null"], format: "uuid" },
          status: {
            type: "string",
            enum: ["Requested", "Accepted", "InProgress", "Completed"],
          },
        },
      },
      CreateRideRequest: {
        type: "object",
        required: ["origin", "destination", "vehicleType"],
        properties: {
          origin: { type: "string", example: "Campus UTN" },
          destination: { type: "string", example: "Downtown" },
          vehicleType: { type: "string", enum: ["Car", "Motorcycle"] },
        },
      },
      AcceptRideRequest: {
        type: "object",
        required: ["driverId"],
        properties: {
          driverId: { type: "string", format: "uuid", description: "ID from GET /api/drivers" },
        },
      },
      ApiError: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};
