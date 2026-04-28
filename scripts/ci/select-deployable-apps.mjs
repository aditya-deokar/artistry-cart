#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const deployableApps = [
  {
    app: "user-ui",
    app_type: "frontend",
    dockerfile: "docker/frontend.Dockerfile",
    app_root: "apps/user-ui",
    build_output: "dist/apps/user-ui",
    app_port: "3000",
  },
  {
    app: "seller-ui",
    app_type: "frontend",
    dockerfile: "docker/frontend.Dockerfile",
    app_root: "apps/seller-ui",
    build_output: "dist/apps/seller-ui",
    app_port: "3001",
  },
  {
    app: "api-gateway",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/api-gateway",
    build_output: "apps/api-gateway/dist",
    app_port: "8080",
  },
  {
    app: "auth-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/auth-service",
    build_output: "apps/auth-service/dist",
    app_port: "6001",
  },
  {
    app: "product-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/product-service",
    build_output: "apps/product-service/dist",
    app_port: "6002",
  },
  {
    app: "order-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/order-service",
    build_output: "apps/order-service/dist",
    app_port: "6004",
  },
  {
    app: "recommendation-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/recommendation-service",
    build_output: "apps/recommendation-service/dist",
    app_port: "6005",
  },
  {
    app: "aivision-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/aivision-service",
    build_output: "apps/aivision-service/dist",
    app_port: "6006",
  },
  {
    app: "kafka-service",
    app_type: "backend",
    dockerfile: "docker/backend.Dockerfile",
    app_root: "apps/kafka-service",
    build_output: "apps/kafka-service/dist",
    app_port: "3000",
  },
];

const sharedPathPrefixes = [
  ".github/workflows/",
  "docker/",
  "packages/",
  "libs/",
  "prisma/",
];

const sharedFiles = new Set([
  ".dockerignore",
  ".env.example",
  ".npmrc",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "nx.json",
  "tsconfig.json",
  "tsconfig.base.json",
  "vitest.config.ts",
]);

function parseArgs(argv) {
  const args = { all: false, apps: [], base: "", head: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--all") {
      args.all = true;
      continue;
    }

    if (token === "--apps") {
      const value = argv[index + 1] ?? "";
      args.apps = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (token === "--base") {
      args.base = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (token === "--head") {
      args.head = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return args;
}

function runGitDiff(base, head) {
  if (!base || !head) {
    return [];
  }

  try {
    const output = execFileSync(
      "git",
      ["-c", `safe.directory=${process.cwd()}`, "diff", "--name-only", base, head],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    return output
      .split(/\r?\n/)
      .map((entry) => entry.trim().replaceAll("\\", "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function selectAppsFromChanges(changedFiles) {
  if (changedFiles.length === 0) {
    return [];
  }

  const selectedApps = new Set();
  let sharedChangeDetected = false;

  for (const file of changedFiles) {
    if (
      sharedFiles.has(file) ||
      sharedPathPrefixes.some((prefix) => file.startsWith(prefix))
    ) {
      sharedChangeDetected = true;
      continue;
    }

    for (const app of deployableApps) {
      if (file.startsWith(`${app.app_root}/`)) {
        selectedApps.add(app.app);
      }
    }
  }

  if (sharedChangeDetected) {
    return deployableApps.map((app) => app.app);
  }

  return deployableApps
    .map((app) => app.app)
    .filter((appName) => selectedApps.has(appName));
}

function buildMatrix(appNames) {
  const selected = new Set(appNames);
  return {
    include: deployableApps.filter((app) => selected.has(app.app)),
  };
}

const args = parseArgs(process.argv.slice(2));

let selectedApps;

if (args.apps.length > 0) {
  const allowed = new Set(deployableApps.map((app) => app.app));
  selectedApps = args.apps.filter((app) => allowed.has(app));
} else if (args.all) {
  selectedApps = deployableApps.map((app) => app.app);
} else {
  selectedApps = selectAppsFromChanges(runGitDiff(args.base, args.head));
}

process.stdout.write(JSON.stringify(buildMatrix(selectedApps)));
