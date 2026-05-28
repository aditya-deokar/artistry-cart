#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const inputDir = resolve(process.argv[2] ?? "image-records");
const outputFile = resolve(process.argv[3] ?? "release-image-manifest.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const fileNames = readdirSync(inputDir)
  .filter((entry) => entry.endsWith(".json"))
  .sort((left, right) => left.localeCompare(right));

if (fileNames.length === 0) {
  throw new Error(`No image record files found in ${inputDir}`);
}

const images = fileNames
  .map((fileName) => readJson(join(inputDir, fileName)))
  .sort((left, right) => left.app.localeCompare(right.app));

const manifest = {
  generatedAt: new Date().toISOString(),
  repository: process.env.GITHUB_REPOSITORY ?? null,
  ref: process.env.GITHUB_REF ?? null,
  sha: process.env.GITHUB_SHA ?? null,
  runId: process.env.GITHUB_RUN_ID ?? null,
  workflow: process.env.GITHUB_WORKFLOW ?? null,
  imageCount: images.length,
  images,
};

writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
