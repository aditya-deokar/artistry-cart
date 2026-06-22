import path from "node:path";

export function createWorkspaceAliases(repoRoot: string) {
  return {
    "@artistry-cart/error-handler/error-middelware": path.resolve(
      repoRoot,
      "packages/error-handler/error-middelware.ts",
    ),
    "@artistry-cart/error-handler": path.resolve(
      repoRoot,
      "packages/error-handler/index.ts",
    ),

    "@artistry-cart/libs/imageKit": path.resolve(
      repoRoot,
      "packages/libs/imageKit/index.ts",
    ),
    "@artistry-cart/libs/prisma": path.resolve(
      repoRoot,
      "packages/libs/prisma/index.ts",
    ),
    "@artistry-cart/libs/redis": path.resolve(
      repoRoot,
      "packages/libs/redis/index.ts",
    ),
    "@artistry-cart/libs": path.resolve(repoRoot, "packages/libs/index.ts"),

    "@artistry-cart/middleware/auth-contract": path.resolve(
      repoRoot,
      "packages/middleware/auth-contract.ts",
    ),
    "@artistry-cart/middleware/authorizedRoles": path.resolve(
      repoRoot,
      "packages/middleware/authorizedRoles.ts",
    ),
    "@artistry-cart/middleware/isAdmin": path.resolve(
      repoRoot,
      "packages/middleware/isAdmin.ts",
    ),
    "@artistry-cart/middleware/isAuthenticated": path.resolve(
      repoRoot,
      "packages/middleware/isAuthenticated.ts",
    ),
    "@artistry-cart/middleware": path.resolve(
      repoRoot,
      "packages/middleware/index.ts",
    ),

    "@artistry-cart/test-utils": path.resolve(
      repoRoot,
      "packages/test-utils/index.ts",
    ),

    "@artistry-cart/utils/kafka/analytics-contract": path.resolve(
      repoRoot,
      "packages/utils/kafka/analytics-contract.ts",
    ),
    "@artistry-cart/utils/kafka/analytics-producer": path.resolve(
      repoRoot,
      "packages/utils/kafka/analytics-producer.ts",
    ),
    "@artistry-cart/utils/kafka/client": path.resolve(
      repoRoot,
      "packages/utils/kafka/client.ts",
    ),
    "@artistry-cart/utils/kafka": path.resolve(
      repoRoot,
      "packages/utils/kafka/index.ts",
    ),
    "@artistry-cart/utils/runtime": path.resolve(
      repoRoot,
      "packages/utils/runtime/index.ts",
    ),
    "@artistry-cart/utils": path.resolve(repoRoot, "packages/utils/index.ts"),
  };
}
