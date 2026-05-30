import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const repairs = [
  {
    source: "node_modules/.pnpm/semver@7.6.3/node_modules/semver/classes/semver.js",
    target: "node_modules/.pnpm/semver@7.7.2/node_modules/semver/classes/semver.js",
  },
  {
    source: "node_modules/.pnpm/semver@7.6.3/node_modules/semver/classes/range.js",
    target: "node_modules/.pnpm/semver@7.7.2/node_modules/semver/classes/range.js",
  },
  {
    source: "node_modules/.pnpm/semver@7.6.3/node_modules/semver/internal/identifiers.js",
    target: "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/identifiers.js",
  },
];

let repairedFiles = 0;

for (const repair of repairs) {
  const sourcePath = path.join(repoRoot, repair.source);
  const targetPath = path.join(repoRoot, repair.target);

  if (fs.existsSync(targetPath)) {
    continue;
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing semver repair source: ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  repairedFiles += 1;
}

if (repairedFiles > 0) {
  console.log(`Repaired ${repairedFiles} missing semver runtime files.`);
} else {
  console.log("Semver runtime files are already present.");
}
