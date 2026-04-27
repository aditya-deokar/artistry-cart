import type { Server } from "node:http";

import type { CorsOptions } from "cors";
import type { Express, RequestHandler } from "express";

type LoggerLike = Pick<typeof console, "error" | "info" | "warn">;

type HealthOptions = {
  serviceName: string;
  readinessCheck?: () => Promise<void> | void;
  metadata?: Record<string, unknown>;
};

type HealthHandlers = {
  liveness: RequestHandler;
  readiness: RequestHandler;
};

type CorsConfig = {
  defaultOrigins?: string[];
  allowedHeaders?: string[];
  methods?: string[];
};

type ShutdownConfig = {
  name: string;
  logger?: LoggerLike;
  timeoutMs?: number;
  onShutdown?: () => Promise<void> | void;
  close?: () => Promise<void> | void;
};

const DEFAULT_ALLOWED_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Requested-With",
  "Accept",
];

const DEFAULT_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

function splitCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function getHost(defaultHost = "0.0.0.0"): string {
  const host = process.env.HOST?.trim();
  return host || defaultHost;
}

export function getPort(defaultPort: number): number {
  const rawPort = process.env.PORT?.trim();
  if (!rawPort) {
    return defaultPort;
  }

  const parsedPort = Number(rawPort);
  return Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : defaultPort;
}

export function getAllowedOrigins(defaultOrigins: string[] = []): string[] {
  const explicitOrigins = splitCsv(process.env.CORS_ALLOWED_ORIGINS);
  if (explicitOrigins.length > 0) {
    return explicitOrigins;
  }

  const origins = new Set(defaultOrigins);
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  if (frontendUrl) {
    origins.add(frontendUrl);
  }

  return Array.from(origins);
}

export function createCorsOptions(config: CorsConfig = {}): CorsOptions {
  const allowedOrigins = getAllowedOrigins(config.defaultOrigins);
  const allowAnyOrigin = allowedOrigins.includes("*");

  return {
    origin(origin, callback) {
      if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    allowedHeaders: config.allowedHeaders ?? DEFAULT_ALLOWED_HEADERS,
    methods: config.methods ?? DEFAULT_METHODS,
  };
}

export function createHealthHandlers(options: HealthOptions): HealthHandlers {
  const liveness: RequestHandler = (_req, res) => {
    res.status(200).json({
      service: options.serviceName,
      status: "ok",
      check: "liveness",
      timestamp: new Date().toISOString(),
      ...(options.metadata ?? {}),
    });
  };

  const readiness: RequestHandler = async (_req, res) => {
    try {
      await options.readinessCheck?.();

      res.status(200).json({
        service: options.serviceName,
        status: "ok",
        check: "readiness",
        timestamp: new Date().toISOString(),
        ...(options.metadata ?? {}),
      });
    } catch (error) {
      res.status(503).json({
        service: options.serviceName,
        status: "error",
        check: "readiness",
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error),
        ...(options.metadata ?? {}),
      });
    }
  };

  return { liveness, readiness };
}

export function registerHealthEndpoints(app: Express, options: HealthOptions): HealthHandlers {
  const handlers = createHealthHandlers(options);
  app.get("/healthz", handlers.liveness);
  app.get("/readyz", handlers.readiness);
  return handlers;
}

export function getServiceUrl(envName: string, fallback: string): string {
  const configuredUrl = process.env[envName]?.trim();
  return configuredUrl || fallback;
}

export async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function registerGracefulShutdown(config: ShutdownConfig): void {
  const logger = config.logger ?? console;
  const timeoutMs = config.timeoutMs ?? 10000;
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info(`${config.name}: ${signal} received, shutting down gracefully`);

    const timeout = setTimeout(() => {
      logger.error(`${config.name}: forced exit after timeout`);
      process.exit(1);
    }, timeoutMs);

    try {
      await config.onShutdown?.();
      await config.close?.();
      clearTimeout(timeout);
      logger.info(`${config.name}: shutdown complete`);
      process.exit(0);
    } catch (error) {
      clearTimeout(timeout);
      logger.error(`${config.name}: shutdown failed`, error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}
