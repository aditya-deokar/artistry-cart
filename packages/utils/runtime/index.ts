import { randomUUID } from "node:crypto";
import type { Server } from "node:http";

import type { CorsOptions } from "cors";
import type { Express, Request, RequestHandler } from "express";

export type AppLogger = {
  child: (bindings: Record<string, unknown>) => AppLogger;
  error: (message: string, metadata?: unknown) => void;
  info: (message: string, metadata?: unknown) => void;
  warn: (message: string, metadata?: unknown) => void;
};

type LoggerLike = Pick<AppLogger, "error" | "info" | "warn">;
type LogLevel = "error" | "info" | "warn";

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

type MetricLabels = Record<string, string | number>;

type MetricType = "counter" | "gauge";

type MetricDefinition = {
  type: MetricType;
  help: string;
  labelNames: string[];
  values: Map<string, number>;
  labelsByKey: Map<string, Record<string, string>>;
};

type HttpObservabilityOptions = {
  serviceName: string;
  logger?: AppLogger;
  metricsPath?: string;
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

function normalizeLogValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeLogValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeLogValue(entry)]),
    );
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createConsoleMethod(level: "error" | "info" | "warn") {
  return level === "error" ? console.error : level === "warn" ? console.warn : console.log;
}

function getConfiguredLogLevel(): LogLevel {
  const rawLevel = process.env.LOG_LEVEL?.trim().toLowerCase();

  if (rawLevel === "error" || rawLevel === "warn" || rawLevel === "info") {
    return rawLevel;
  }

  return "info";
}

function shouldLog(level: LogLevel): boolean {
  const priorities: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
  };

  return priorities[level] <= priorities[getConfiguredLogLevel()];
}

function writeLog(
  serviceName: string,
  level: "error" | "info" | "warn",
  message: string,
  metadata?: unknown,
  bindings: Record<string, unknown> = {},
): void {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const normalizedMetadata = normalizeLogValue(metadata);
  const entry: Record<string, unknown> = {
    timestamp,
    level,
    service: serviceName,
    message,
    ...bindings,
  };

  if (normalizedMetadata !== undefined) {
    if (isRecord(normalizedMetadata)) {
      Object.assign(entry, normalizedMetadata);
    } else {
      entry.metadata = normalizedMetadata;
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
    return;
  }

  const consoleMethod = createConsoleMethod(level);
  const details = Object.entries(entry)
    .filter(([key]) => !["timestamp", "level", "service", "message"].includes(key))
    .reduce<Record<string, unknown>>((result, [key, value]) => {
      result[key] = value;
      return result;
    }, {});

  if (Object.keys(details).length === 0) {
    consoleMethod(`[${timestamp}] ${level.toUpperCase()} ${serviceName}: ${message}`);
    return;
  }

  consoleMethod(
    `[${timestamp}] ${level.toUpperCase()} ${serviceName}: ${message} ${JSON.stringify(details)}`,
  );
}

export function createLogger(
  serviceName: string,
  bindings: Record<string, unknown> = {},
): AppLogger {
  const child = (extraBindings: Record<string, unknown>) =>
    createLogger(serviceName, { ...bindings, ...extraBindings });

  return {
    child,
    info(message, metadata) {
      writeLog(serviceName, "info", message, metadata, bindings);
    },
    warn(message, metadata) {
      writeLog(serviceName, "warn", message, metadata, bindings);
    },
    error(message, metadata) {
      writeLog(serviceName, "error", message, metadata, bindings);
    },
  };
}

export class MetricsRegistry {
  private readonly metrics = new Map<string, MetricDefinition>();

  constructor(private readonly serviceName: string) {}

  private ensureMetric(
    name: string,
    type: MetricType,
    help: string,
    labelNames: string[],
  ): MetricDefinition {
    const existing = this.metrics.get(name);
    if (existing) {
      return existing;
    }

    const definition: MetricDefinition = {
      type,
      help,
      labelNames,
      values: new Map(),
      labelsByKey: new Map(),
    };

    this.metrics.set(name, definition);
    return definition;
  }

  counter(name: string, help: string, labelNames: string[] = []) {
    const metric = this.ensureMetric(name, "counter", help, labelNames);

    return {
      inc: (labels: MetricLabels = {}, value = 1) => {
        const key = this.labelKey(metric.labelNames, labels);
        metric.values.set(key, (metric.values.get(key) ?? 0) + value);
        metric.labelsByKey.set(key, this.normalizeLabels(metric.labelNames, labels));
      },
    };
  }

  gauge(name: string, help: string, labelNames: string[] = []) {
    const metric = this.ensureMetric(name, "gauge", help, labelNames);

    return {
      inc: (labels: MetricLabels = {}, value = 1) => {
        const key = this.labelKey(metric.labelNames, labels);
        metric.values.set(key, (metric.values.get(key) ?? 0) + value);
        metric.labelsByKey.set(key, this.normalizeLabels(metric.labelNames, labels));
      },
      set: (labels: MetricLabels = {}, value: number) => {
        const key = this.labelKey(metric.labelNames, labels);
        metric.values.set(key, value);
        metric.labelsByKey.set(key, this.normalizeLabels(metric.labelNames, labels));
      },
    };
  }

  private labelKey(labelNames: string[], labels: MetricLabels): string {
    return labelNames.map((name) => `${name}=${String(labels[name] ?? "")}`).join("|");
  }

  private normalizeLabels(
    labelNames: string[],
    labels: MetricLabels,
  ): Record<string, string> {
    return Object.fromEntries(
      labelNames.map((name) => [name, String(labels[name] ?? "")]),
    );
  }

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) {
      return "";
    }

    const encoded = entries
      .map(([key, value]) => `${key}="${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`)
      .join(",");

    return `{${encoded}}`;
  }

  render(): string {
    const lines = [
      "# HELP app_info Static application metadata",
      "# TYPE app_info gauge",
      `app_info{service="${this.serviceName}"} 1`,
      "# HELP process_uptime_seconds Process uptime in seconds",
      "# TYPE process_uptime_seconds gauge",
      `process_uptime_seconds{service="${this.serviceName}"} ${process.uptime().toFixed(3)}`,
    ];

    for (const [name, metric] of this.metrics.entries()) {
      lines.push(`# HELP ${name} ${metric.help}`);
      lines.push(`# TYPE ${name} ${metric.type}`);

      if (metric.values.size === 0) {
        lines.push(`${name} 0`);
        continue;
      }

      for (const [key, value] of metric.values.entries()) {
        const labels = metric.labelsByKey.get(key) ?? {};
        lines.push(`${name}${this.formatLabels(labels)} ${value}`);
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function getRouteLabel(req: Request): string {
  const routePath =
    typeof (req.route as { path?: unknown } | undefined)?.path === "string"
      ? (req.route as { path: string }).path
      : undefined;

  if (routePath) {
    return `${req.baseUrl ?? ""}${routePath}` || routePath;
  }

  return req.path || req.originalUrl.split("?")[0] || "unknown";
}

function shouldSkipRequestLog(pathname: string): boolean {
  return (
    pathname === "/healthz" ||
    pathname === "/readyz" ||
    pathname === "/health" ||
    pathname === "/ready" ||
    pathname === "/gateway-health" ||
    pathname === "/metrics"
  );
}

export function createSecurityHeadersMiddleware(): RequestHandler {
  return (_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  };
}

export function setupHttpObservability(
  app: Express,
  options: HttpObservabilityOptions,
): {
  logger: AppLogger;
  metrics: MetricsRegistry;
} {
  const logger = options.logger ?? createLogger(options.serviceName);
  const metrics = new MetricsRegistry(options.serviceName);
  const inflightRequests = metrics.gauge(
    "http_inflight_requests",
    "Current inflight HTTP requests",
  );
  const requestTotal = metrics.counter(
    "http_requests_total",
    "Total HTTP requests handled",
    ["method", "route", "status"],
  );
  const requestErrorsTotal = metrics.counter(
    "http_request_errors_total",
    "Total HTTP requests that returned an error status",
    ["method", "route", "status"],
  );
  const requestDurationTotal = metrics.counter(
    "http_request_duration_ms_total",
    "Cumulative HTTP request duration in milliseconds",
    ["method", "route", "status"],
  );

  app.disable("x-powered-by");
  app.use(createSecurityHeadersMiddleware());

  app.use((req, res, next) => {
    const requestId = req.header("x-request-id")?.trim() || randomUUID();
    const startedAt = process.hrtime.bigint();
    const requestLogger = logger.child({ requestId });

    res.setHeader("x-request-id", requestId);
    inflightRequests.inc({}, 1);

    res.once("finish", () => {
      inflightRequests.inc({}, -1);

      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const route = getRouteLabel(req);
      const status = String(res.statusCode);

      requestTotal.inc({ method: req.method, route, status });
      requestDurationTotal.inc({ method: req.method, route, status }, durationMs);

      if (res.statusCode >= 400) {
        requestErrorsTotal.inc({ method: req.method, route, status });
      }

      if (!shouldSkipRequestLog(route) || res.statusCode >= 400) {
        requestLogger.info("HTTP request completed", {
          method: req.method,
          route,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(3)),
          ip: req.ip,
          userAgent: req.get("user-agent"),
        });
      }
    });

    next();
  });

  app.get(options.metricsPath ?? "/metrics", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(metrics.render());
  });

  return { logger, metrics };
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
