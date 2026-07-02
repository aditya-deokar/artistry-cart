import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(repoRoot, ".env.test") });

process.env.NODE_ENV ??= "test";
process.env.HOST ??= "127.0.0.1";
process.env.GOOGLE_API_KEY ??= "test-google-api-key";
process.env.AIVISION_SERVICE_URL ??= "http://localhost:6006";
process.env.KAFKA_SERVICE_URL ??= "http://localhost:3000";
process.env.IMAGEKIT_PUBLIC_API_KEY ??=
  process.env.IMAGEKIT_PUBLIC_KEY ??
  "test_public_key";
process.env.IMAGEKIT_PRIVATE_API_KEY ??=
  process.env.IMAGEKIT_PRIVATE_KEY ??
  "test_private_key";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function joinUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

const services = {
  auth: {
    label: "auth-service",
    project: "@artistry-cart/auth-service",
    readyUrl: joinUrl(
      process.env.AUTH_SERVICE_URL ?? "http://localhost:6001",
      "/readyz",
    ),
  },
  product: {
    label: "product-service",
    project: "@artistry-cart/product-service",
    readyUrl: joinUrl(
      process.env.PRODUCT_SERVICE_URL ?? "http://localhost:6002",
      "/readyz",
    ),
  },
  order: {
    label: "order-service",
    project: "@artistry-cart/order-service",
    readyUrl: joinUrl(
      process.env.ORDER_SERVICE_URL ?? "http://localhost:6004",
      "/readyz",
    ),
  },
  recommendation: {
    label: "recommendation-service",
    project: "@artistry-cart/recommendation-service",
    readyUrl: joinUrl(
      process.env.RECOMMENDATION_SERVICE_URL ?? "http://localhost:6005",
      "/readyz",
    ),
  },
  gateway: {
    label: "api-gateway",
    project: "@artistry-cart/api-gateway",
    readyUrl: joinUrl(
      process.env.API_GATEWAY_URL ?? "http://localhost:8080",
      "/readyz",
    ),
  },
  aivision: {
    label: "aivision-service",
    project: "@artistry-cart/aivision-service",
    readyUrl: joinUrl(
      process.env.AIVISION_SERVICE_URL ?? "http://localhost:6006",
      "/readyz",
    ),
  },
  kafka: {
    label: "kafka-service",
    project: "@artistry-cart/kafka-service",
    readyUrl: joinUrl(
      process.env.KAFKA_SERVICE_URL ?? "http://localhost:3000",
      "/healthz",
    ),
  },
};

const suites = {
  "auth-service-e2e": {
    config: "apps/auth-service-e2e/vitest.config.ts",
    services: ["auth"],
  },
  "product-service-e2e": {
    config: "apps/product-service-e2e/vitest.config.ts",
    services: ["auth", "product"],
  },
  "order-service-e2e": {
    config: "apps/order-service-e2e/vitest.config.ts",
    services: ["auth", "order"],
  },
  "recommendation-service-e2e": {
    config: "apps/recommendation-service-e2e/vitest.config.ts",
    services: ["auth", "recommendation"],
  },
  "api-gateway-e2e": {
    config: "apps/api-gateway-e2e/vitest.config.ts",
    services: ["auth", "product", "order", "recommendation", "gateway"],
  },
  "aivision-service-e2e": {
    config: "apps/aivision-service-e2e/vitest.config.ts",
    services: ["aivision"],
  },
  "kafka-service-e2e": {
    config: "apps/kafka-service-e2e/vitest.config.ts",
    services: ["kafka"],
  },
};

const suiteGroups = {
  core: [
    "auth-service-e2e",
    "product-service-e2e",
    "order-service-e2e",
    "recommendation-service-e2e",
    "api-gateway-e2e",
  ],
  all: [
    "auth-service-e2e",
    "product-service-e2e",
    "order-service-e2e",
    "recommendation-service-e2e",
    "api-gateway-e2e",
    "aivision-service-e2e",
    "kafka-service-e2e",
  ],
};

function resolveSuites(argv) {
  if (argv.length === 0) {
    return suiteGroups.core;
  }

  const resolved = [];
  for (const value of argv) {
    if (value in suiteGroups) {
      resolved.push(...suiteGroups[value]);
      continue;
    }

    if (!(value in suites)) {
      const allowedValues = [
        ...Object.keys(suiteGroups),
        ...Object.keys(suites),
      ].join(", ");
      throw new Error(`Unknown suite "${value}". Expected one of: ${allowedValues}`);
    }

    resolved.push(value);
  }

  return [...new Set(resolved)];
}

function prefixOutput(stream, prefix) {
  if (!stream) {
    return;
  }

  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`[${prefix}] ${line}`);
      }
    }
  });

  stream.on("end", () => {
    if (buffer.trim().length > 0) {
      console.log(`[${prefix}] ${buffer}`);
    }
  });
}

function spawnChild(args, label, envOverrides = {}) {
  const child = spawn(pnpmCommand, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...envOverrides,
    },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  prefixOutput(child.stdout, label);
  prefixOutput(child.stderr, label);

  return child;
}

async function runNodeScript(scriptRelativePath, label) {
  const child = spawn(process.execPath, [path.join(repoRoot, scriptRelativePath)], {
    cwd: repoRoot,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  prefixOutput(child.stdout, label);
  prefixOutput(child.stderr, label);

  return new Promise((resolve, reject) => {
    child.once("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function waitForUrl(url, label, timeoutMs = 90_000) {
  const startedAt = Date.now();
  let lastError = "No response received";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await delay(500);
  }

  throw new Error(`${label} was not ready at ${url}: ${lastError}`);
}

async function waitForExit(child, label, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (!settled) {
        settled = true;
        resolve(undefined);
      }
    };

    if (child.exitCode !== null || child.killed) {
      return finish();
    }

    child.once("exit", finish);

    setTimeout(() => {
      if (!settled) {
        console.warn(`[${label}] did not exit within ${timeoutMs}ms`);
        finish();
      }
    }, timeoutMs).unref?.();
  });
}

async function stopChild(child, label) {
  if (child.exitCode !== null || child.killed) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve, reject) => {
      const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: ["ignore", "ignore", "pipe"],
      });

      let errorOutput = "";
      killer.stderr?.on("data", (chunk) => {
        errorOutput += chunk.toString();
      });

      killer.once("exit", (code) => {
        if (code === 0 || code === 128) {
          resolve(undefined);
          return;
        }

        reject(new Error(errorOutput || `taskkill failed with exit code ${code}`));
      });
    });

    await waitForExit(child, label);
    return;
  }

  child.kill("SIGINT");
  await waitForExit(child, label);
}

async function runVitest(configPath, label) {
  const child = spawnChild(
    [
      "exec",
      "vitest",
      "run",
      "--configLoader",
      "runner",
      "--config",
      configPath,
    ],
    label,
  );

  return new Promise((resolve, reject) => {
    child.once("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  const requestedSuites = resolveSuites(process.argv.slice(2));
  const requiredServices = [
    ...new Set(
      requestedSuites.flatMap((suiteName) => suites[suiteName].services),
    ),
  ];
  const runningServices = [];

  try {
    await runNodeScript("tools/repair-semver.mjs", "repair:toolchain");

    for (const serviceKey of requiredServices) {
      const service = services[serviceKey];
      const label = `serve:${service.label}`;
      console.log(`Starting ${service.label}...`);

      const child = spawnChild(
        ["exec", "nx", "run", `${service.project}:serve`],
        label,
      );
      let serviceReady = false;

      const exitBeforeReady = new Promise((_, reject) => {
        child.once("exit", (code) => {
          if (serviceReady) {
            console.warn(
              `[${service.label}] exited after reporting ready (exit code ${code ?? "unknown"})`,
            );
            return;
          }

          reject(
            new Error(
              `${service.label} exited before becoming ready (exit code ${code ?? "unknown"})`,
            ),
          );
        });
      });

      await Promise.race([
        waitForUrl(service.readyUrl, service.label),
        exitBeforeReady,
      ]);
      serviceReady = true;

      runningServices.push({ child, label, service });
      console.log(`${service.label} is ready at ${service.readyUrl}`);
    }

    for (const suiteName of requestedSuites) {
      console.log(`Running ${suiteName}...`);
      await runVitest(suites[suiteName].config, `vitest:${suiteName}`);
    }
  } finally {
    for (const runningService of [...runningServices].reverse()) {
      try {
        console.log(`Stopping ${runningService.service.label}...`);
        await stopChild(runningService.child, runningService.label);
      } catch (error) {
        console.warn(
          `[${runningService.service.label}] failed to stop cleanly: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
