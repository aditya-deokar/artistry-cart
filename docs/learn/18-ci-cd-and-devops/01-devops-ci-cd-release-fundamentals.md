# DevOps, CI, CD, And Release Fundamentals

## What DevOps Means

DevOps is the engineering practice of making software delivery reliable, repeatable, observable, and fast.

It is not only a job title or a tool set. It is the discipline of connecting:

- development
- testing
- infrastructure
- deployment
- monitoring
- incident response
- feedback loops

The core idea is simple:

```text
software should move from code to production through automated, visible, repeatable steps
```

## Why DevOps Exists

Without DevOps practices, teams often have these problems:

- code works on one machine but fails elsewhere
- tests are skipped or run inconsistently
- deployments are manual and risky
- secrets are copied around by hand
- production behavior is hard to observe
- rollback decisions are slow
- releases depend on one person's memory

DevOps tries to replace fragile human procedure with automated systems and clear ownership.

## CI

CI means continuous integration.

It answers:

```text
Does this change integrate safely with the rest of the codebase?
```

A strong CI pipeline usually runs:

- dependency installation
- type checks
- linting
- unit tests
- integration tests
- build checks
- e2e tests where needed
- security or dependency checks where appropriate

In Artistry Cart, `.github/workflows/test.yml` runs validation on pull requests and pushes to `master`.

## CD

CD can mean continuous delivery or continuous deployment.

Continuous delivery means:

```text
every valid change is ready to deploy
```

Continuous deployment means:

```text
every valid change is automatically deployed to production
```

Many serious teams use continuous delivery with a manual production approval. That gives automation plus human control at the final production step.

Artistry Cart follows this kind of shape:

- staging can deploy after successful image publishing
- production deployment is manual through `workflow_dispatch`

## Deployment Versus Release

Deployment means putting code into an environment.

Release means making functionality available to users.

They are not always the same:

- code can be deployed but hidden behind a feature flag
- code can be released gradually to a percentage of users
- code can be deployed to staging but not released to production

Interviewers like this distinction because it shows operational maturity.

## Pipeline

A pipeline is a sequence of automated stages.

Example:

```text
checkout -> install -> test -> build -> package -> scan -> publish -> deploy -> verify
```

Each stage should answer a specific risk question:

- install: can dependencies resolve reproducibly?
- test: does behavior still work?
- build: can production artifacts be produced?
- package: can the app run as a deployable unit?
- scan: are there known high-risk vulnerabilities?
- deploy: can the target environment accept the change?
- verify: does the deployed system respond correctly?

## Artifact

An artifact is an output from one pipeline stage that later stages consume.

Examples:

- test coverage report
- Docker image
- image digest
- release manifest
- rendered Kubernetes YAML
- security scan report

Artifacts matter because they create traceability.

## Environment

An environment is a target place where software runs.

Common environments:

- local
- CI
- test
- dev
- staging
- production

Each environment should be similar enough to catch real problems, but production deserves the strongest controls.

## Strong Interview Answer

If asked "What is CI/CD?", say:

> CI validates that a change integrates safely by running automated tests, builds, and quality checks. CD automates the path from validated code to deployable or deployed software. A good pipeline gives fast feedback, repeatability, traceability, security checks, and safer releases across staging and production.

## Artistry Cart Connection

Artistry Cart uses GitHub Actions for CI/CD. The repo has separate workflows for test validation, image build and publish, staging deployment, production deployment, and nightly security scans.
