import express, { type Express } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import {
  createCorsOptions,
  registerHealthEndpoints,
} from "../../../packages/utils/runtime";
import type { GatewayConfig } from "./config";

export function createGatewayApp(config: GatewayConfig): Express {
  const app = express();

  app.use(
    cors(
      createCorsOptions({
        defaultOrigins: config.corsAllowedOrigins,
        allowedHeaders: ["Authorization", "Content-Type"],
      }),
    ),
  );

  app.use(morgan("dev"));
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ limit: "30mb", extended: true }));
  app.use(cookieParser());
  app.set("trust proxy", 1);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: any) => (req.user ? 1000 : 100),
    message: {
      error: "Too many Reqeusts, please try again later!",
    },
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => req.ip,
  });

  app.use(limiter);

  registerHealthEndpoints(app, {
    serviceName: "api-gateway",
    metadata: {
      upstreams: config.upstreams,
    },
  });

  app.get("/gateway-health", (_req, res) => {
    res.status(200).json({
      message: "Welcome to api-gateway!",
      service: "api-gateway",
      status: "ok",
    });
  });

  app.use("/auth", proxy(config.upstreams.auth));
  app.use("/product", proxy(config.upstreams.product));
  app.use("/recommendation", proxy(config.upstreams.recommendation));
  app.use("/ai-vision", proxy(config.upstreams.aiVision));
  app.use(
    "/order",
    proxy(config.upstreams.order, {
      proxyReqPathResolver: (req) => req.originalUrl,
    }),
  );

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
