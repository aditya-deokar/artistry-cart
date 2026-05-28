#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const EXPECTED_APPS = [
  "user-ui",
  "seller-ui",
  "api-gateway",
  "auth-service",
  "product-service",
  "order-service",
  "recommendation-service",
  "aivision-service",
  "kafka-service",
];

function parseArgs(argv) {
  const args = {
    requireAll: false,
    manifestPath: null,
    kustomizationPath: null,
  };

  for (const argument of argv) {
    if (argument === "--require-all") {
      args.requireAll = true;
      continue;
    }

    if (!args.manifestPath) {
      args.manifestPath = argument;
      continue;
    }

    if (!args.kustomizationPath) {
      args.kustomizationPath = argument;
      continue;
    }

    throw new Error(`Unexpected argument: ${argument}`);
  }

  if (!args.manifestPath || !args.kustomizationPath) {
    throw new Error(
      "Usage: node scripts/ci/render-kustomize-images-from-manifest.mjs [--require-all] <manifest.json> <kustomization.yaml>",
    );
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function ensureCompleteManifest(images) {
  const apps = new Set(images.map((image) => image.app));
  const missingApps = EXPECTED_APPS.filter((app) => !apps.has(app));

  if (missingApps.length > 0) {
    throw new Error(
      `Release manifest is missing required apps: ${missingApps.join(", ")}`,
    );
  }
}

function buildImagesBlock(images) {
  const lines = ["images:"];

  for (const image of images.sort((left, right) => left.app.localeCompare(right.app))) {
    lines.push(`  - name: ghcr.io/your-org/artistry-cart-${image.app}`);
    lines.push(`    newName: ${image.repository}`);
    lines.push(`    digest: ${image.digest}`);
  }

  return `${lines.join("\n")}\n`;
}

function replaceImagesBlock(document, imagesBlock) {
  const marker = /^images:\s*$/m;
  const match = document.match(marker);

  if (!match || match.index === undefined) {
    const normalized = document.endsWith("\n") ? document : `${document}\n`;
    return `${normalized}\n${imagesBlock}`;
  }

  const before = document.slice(0, match.index);
  return `${before}${imagesBlock}`;
}

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(args.manifestPath);
const kustomizationPath = resolve(args.kustomizationPath);

const manifest = readJson(manifestPath);
const images = Array.isArray(manifest.images) ? manifest.images : [];

if (args.requireAll) {
  ensureCompleteManifest(images);
}

if (images.length === 0) {
  throw new Error("Release manifest does not contain any images");
}

const kustomization = readFileSync(kustomizationPath, "utf8");
const updated = replaceImagesBlock(kustomization, buildImagesBlock(images));
writeFileSync(kustomizationPath, updated);

process.stdout.write(
  `Updated ${kustomizationPath} with ${images.length} image references from ${manifestPath}\n`,
);
