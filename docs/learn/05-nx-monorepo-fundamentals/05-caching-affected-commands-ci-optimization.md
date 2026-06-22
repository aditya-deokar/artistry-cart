# Caching, Affected Commands, And CI Optimization

## Why CI Gets Slow In Monorepos

In a monorepo, one repository can contain many projects.

If CI always runs everything:

```text
build all apps
test all packages
run all e2e suites
build all containers
```

feedback becomes slow and expensive.

Nx improves this with:

- caching
- affected project detection
- dependency-aware task execution
- parallelism

## Nx Cache

Nx can cache task results.

If the same task runs with the same inputs, Nx can reuse the previous output.

Example:

```text
build utils
same source files and same config
reuse cached build output
```

This saves time locally and in CI.

## What Makes A Cache Valid

Nx considers:

- project source files
- dependency source files
- relevant config files
- lockfile/dependency changes
- named inputs
- environment/tooling inputs when configured

If an input changes, cache should be invalidated.

## Inputs

Inputs tell Nx what matters for a task.

Example:

```text
production input excludes tests
```

So changing a spec file should not necessarily invalidate a production build.

## Outputs

Outputs tell Nx what a task produces.

Examples:

```text
dist/
.next/
coverage/
```

For caching to work well, outputs should be declared correctly.

## Affected Commands

Affected commands run tasks only for projects impacted by a change.

Example:

```bash
pnpm exec nx affected --target=test --base=origin/master --head=HEAD
```

Nx compares changed files between base and head, maps them to projects, then includes dependent projects.

## Affected Example

Change:

```text
packages/middleware/isAuthenticated.ts
```

Affected projects may include:

- `middleware`
- `auth-service`
- `product-service`
- `order-service`
- `api-gateway`
- tests that depend on auth middleware

Change:

```text
docs/learn/README.md
```

Affected app builds should usually be none.

## Run-Many Versus Affected

`run-many`:

```text
Run target on explicitly selected projects.
```

Example:

```bash
pnpm exec nx run-many --target=build --projects=auth-service,product-service
```

`affected`:

```text
Calculate impacted projects from Git changes.
```

Example:

```bash
pnpm exec nx affected --target=test
```

Use `run-many` when you know exactly what to run. Use `affected` for PR validation.

## Parallelism

Nx can run independent tasks in parallel.

Example:

```bash
pnpm exec nx affected --target=test --parallel=3
```

Parallelism speeds up CI but should respect:

- CPU limits
- memory limits
- database/test isolation
- port conflicts

## E2E Tests And Caching

E2E tests often should not be cached because they depend on live runtime state:

- services running
- databases
- ports
- Docker containers
- network timing

This repo disables cache for e2e targets.

That is a good default for integration confidence.

## CI Strategy In A Monorepo

Common pattern:

Pull request:

```text
install
generate clients
run affected tests
run affected builds
```

Main branch:

```text
run broader tests
build deployable apps
publish artifacts/images
deploy if needed
```

E2E:

```text
start dependencies
start services
wait for readiness
run e2e suites
collect logs on failure
```

## Interview Explanation

If asked "How does Nx optimize CI?", say:

> Nx builds a project graph and uses Git changes to calculate affected projects. It then runs targets like build or test only for those projects and their dependents. Nx also caches task outputs based on declared inputs and can parallelize independent tasks. This keeps monorepo CI fast without skipping necessary validation.

## Connection To Artistry Cart

Artistry Cart's CI uses:

- affected tests on pull requests
- affected builds on pull requests
- broader validation on pushes
- build of deployable apps
- e2e service startup and readiness checks
- Nx run-many for selected service groups

