import express, { type Express } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import {
  createCorsOptions,
  registerHealthEndpoints,
  setupHttpObservability,
  type AppLogger,
} from "@artistry-cart/utils/runtime";
import type { GatewayConfig } from "./config";

export function createGatewayApp(config: GatewayConfig, logger: AppLogger): Express {
  const app = express();
  const parsedWindowMs = Number(process.env.GATEWAY_RATE_LIMIT_WINDOW_MS ?? "900000");
  const parsedMaxRequests = Number(process.env.GATEWAY_RATE_LIMIT_MAX ?? "100");
  const rateLimitWindowMs =
    Number.isFinite(parsedWindowMs) && parsedWindowMs > 0 ? parsedWindowMs : 900000;
  const rateLimitMaxRequests =
    Number.isFinite(parsedMaxRequests) && parsedMaxRequests > 0
      ? parsedMaxRequests
      : 100;

  setupHttpObservability(app, {
    serviceName: "api-gateway",
    logger,
  });

  app.use(
    cors(
      createCorsOptions({
        defaultOrigins: config.corsAllowedOrigins,
        allowedHeaders: ["Authorization", "Content-Type"],
      }),
    ),
  );

  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ limit: "30mb", extended: true }));
  app.use(cookieParser());
  app.set("trust proxy", 1);

  const limiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMaxRequests,
    message: {
      error: "Too many requests, please try again later!",
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
