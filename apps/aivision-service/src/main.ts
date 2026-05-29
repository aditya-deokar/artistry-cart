import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import prisma from "@artistry-cart/libs/prisma";
import {
  closeServer,
  createCorsOptions,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
  setupHttpObservability,
} from "@artistry-cart/utils/runtime";
import { errorMiddleware } from "./middleware/error.middleware";
import routes from "./routes";
import { initAgenda, stopAgenda } from "./jobs/agenda";
import { logger } from "./utils/logger";

const host = getHost();
const port = getPort(6006);

const app: Express = express();

setupHttpObservability(app, {
  serviceName: "aivision-service",
  logger,
});

const dbUrl = process.env.DATABASE_URL;
logger.info("Service Startup Config:", {
  host,
  port,
  dbUrlMasked: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ":***@") : "UNDEFINED",
  nodeEnv: process.env.NODE_ENV,
});

app.use(
  cors(
    createCorsOptions({
      allowedHeaders: [
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "X-Session-Token",
      ],
    }),
  ),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

const { readiness } = registerHealthEndpoints(app, {
  serviceName: "aivision-service",
  readinessCheck: async () => {
    await prisma.$connect();
    await prisma.$runCommandRaw({ ping: 1 });
  },
});

app.get("/health", readiness);
app.get("/ready", readiness);

app.get("/", (_req, res) => {
  res.json({
    message: "AI Vision Service API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      generate: "/api/v1/ai/generate",
      search: "/api/v1/ai/search",
      concepts: "/api/v1/ai/concepts",
      artisans: "/api/v1/ai/artisans",
      gallery: "/api/v1/ai/gallery",
    },
  });
});

app.use("/api/v1/ai", routes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorMiddleware);

const server = app.listen(port, host, async () => {
  logger.info(`AI Vision Service running at http://${host}:${port}`);
  logger.info(`Health Check: http://${host}:${port}/healthz`);
  logger.info(`API: http://${host}:${port}/api/v1/ai`);

  try {
    await initAgenda();
    logger.info("Background jobs initialized");
  } catch (error) {
    logger.warn("Failed to initialize background jobs", { error });
  }
});

server.on("error", (err) => {
  logger.error("Server Error:", err);
});

registerGracefulShutdown({
  name: "aivision-service",
  logger,
  onShutdown: () => stopAgenda(),
  close: () => closeServer(server),
});

export default app;
