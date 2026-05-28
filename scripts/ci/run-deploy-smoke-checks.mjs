#!/usr/bin/env node

const environmentName = process.argv[2] ?? "environment";

const checks = [
  {
    name: "user-ui",
    baseUrl: process.env.SMOKE_USER_UI_URL?.trim(),
    path: "/healthz",
  },
  {
    name: "seller-ui",
    baseUrl: process.env.SMOKE_SELLER_UI_URL?.trim(),
    path: "/healthz",
  },
  {
    name: "api-gateway",
    baseUrl: process.env.SMOKE_API_GATEWAY_URL?.trim(),
    path: "/readyz",
  },
];

function buildUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

const enabledChecks = checks.filter((check) => Boolean(check.baseUrl));

if (enabledChecks.length === 0) {
  process.stdout.write(
    `No smoke-test URLs configured for ${environmentName}; skipping deploy smoke checks.\n`,
  );
  process.exit(0);
}

for (const check of enabledChecks) {
  const url = buildUrl(check.baseUrl, check.path);
  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(10000),
    headers: {
      "user-agent": "artistry-cart-deploy-smoke-check",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Smoke check failed for ${check.name} in ${environmentName}: ${url} returned ${response.status}`,
    );
  }

  process.stdout.write(
    `Smoke check passed for ${check.name} in ${environmentName}: ${url}\n`,
  );
}
