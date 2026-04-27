# Commands and Workflows

## Install

```bash
pnpm install
```

## Core Root Scripts

Defined in the root `package.json`:

```bash
pnpm dev
pnpm user-ui
pnpm seller-ui
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:ui
pnpm test:product
pnpm test:auth
pnpm test:order
pnpm test:gateway
pnpm test:recommendation
pnpm test:middleware
pnpm test:error-handler
```

## Nx Service Commands

For focused development, prefer explicit Nx targets per app:

```bash
pnpm exec nx serve auth-service
pnpm exec nx serve product-service
pnpm exec nx serve order-service
pnpm exec nx serve recommendation-service
pnpm exec nx serve api-gateway
pnpm exec nx serve aivision-service
pnpm exec nx serve kafka-service
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
```

## Build Commands

Examples:

```bash
pnpm exec nx build auth-service
pnpm exec nx build product-service
pnpm exec nx build order-service
pnpm exec nx build recommendation-service
pnpm exec nx build api-gateway
pnpm exec nx build aivision-service
pnpm exec nx build user-ui
pnpm exec nx build seller-ui
```

For broad backend builds, the CI workflow uses:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service,order-service,recommendation-service,api-gateway --parallel=5
```

## Test Workflows

### Full test suite

```bash
pnpm test
```

### Coverage

```bash
pnpm test:coverage
```

### Service-focused tests

```bash
pnpm test:auth
pnpm test:product
pnpm test:order
pnpm test:gateway
pnpm test:recommendation
```

### Shared-package tests

```bash
pnpm test:middleware
pnpm test:error-handler
```

## Local Infra Workflow

Start Kafka infrastructure:

```bash
docker compose -f libs/docker-compose.yml up -d
```

Stop Kafka infrastructure:

```bash
docker compose -f libs/docker-compose.yml down
```

## Prisma Workflow

Common commands inferred from the current stack:

```bash
npx prisma generate
```

This command is explicitly used in CI before tests run.

## Useful Nx Discovery Commands

```bash
pnpm exec nx show project auth-service
pnpm exec nx show project user-ui
pnpm exec nx graph
```

These are useful when you want to inspect inferred targets, dependencies, or workspace relationships.

## Common Work Modes

### Frontend-only iteration

Use:

```bash
pnpm exec nx dev user-ui
pnpm exec nx dev seller-ui
```

Plus the required backend services or gateway if the page depends on live APIs.

### Backend API iteration

Use one or more of:

```bash
pnpm exec nx serve auth-service
pnpm exec nx serve product-service
pnpm exec nx serve order-service
pnpm exec nx serve recommendation-service
pnpm exec nx serve api-gateway
```

### AI feature iteration

Use:

```bash
pnpm exec nx serve aivision-service
pnpm exec nx dev user-ui
```

And ensure AI/ImageKit environment variables are present.

### Analytics and recommendations iteration

Use:

```bash
docker compose -f libs/docker-compose.yml up -d
pnpm exec nx serve kafka-service
pnpm exec nx serve recommendation-service
```

## CI Workflow Summary

The current GitHub Actions pipeline does the following:

- installs dependencies
- generates Prisma client
- runs affected tests on pull requests
- runs full tests and coverage on pushes to `master`
- builds core backend services for e2e
- starts backend services on CI ports
- runs Nx e2e projects

The source workflow is `.github/workflows/test.yml`.

## Related Docs

- [Local Development](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)
- [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)
