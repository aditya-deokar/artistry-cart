# Secrets, Security, Observability, And Failure Debugging

## Secrets In CI/CD

Secrets are sensitive values required by automation.

Examples:

- kubeconfig
- registry tokens
- cloud credentials
- API keys
- webhook secrets
- database passwords

Strong rule:

```text
secrets should be injected at runtime, not committed to the repo and not baked into images
```

## GitHub Environments

GitHub environments can protect deployments.

They can provide:

- environment-scoped secrets
- required reviewers
- deployment history
- branch restrictions

Artistry Cart deploy jobs use:

```text
environment: staging
environment: production
```

That allows different secret and approval rules per environment.

## Least Privilege

Workflows should request only necessary permissions.

Examples:

- test workflows may only need repository read access
- image publishing needs package write access
- security scanning needs security event write access
- deploy workflows need artifact read access and kubeconfig secret access

This reduces blast radius if a workflow or token is compromised.

## Dependency Automation

The repo includes:

```text
.github/dependabot.yml
```

Dependabot helps keep dependencies and GitHub Actions updated.

Dependency automation is part of DevOps because operational security includes patch management.

## Nightly Security Scans

Artistry Cart has:

```text
.github/workflows/nightly-security.yml
```

It runs:

- Trivy filesystem scan
- pnpm production dependency audit

It uploads:

- SARIF results to GitHub Security
- scan artifacts
- audit JSON artifact

Nightly scans catch problems that may appear after code was merged, because vulnerability databases change over time.

## Image Scanning Versus Filesystem Scanning

Image scanning checks built container images.

Filesystem scanning checks the repository contents.

Both are useful:

- repo scan finds dependency and source-level risks
- image scan finds runtime package and OS-level risks

## Observability In CI/CD

CI/CD observability means the pipeline gives enough information to debug and audit.

Good signals:

- job summaries
- uploaded artifacts
- service logs on failure
- rendered Kubernetes manifests
- coverage reports
- scan reports
- image digests
- deployment summaries

Artistry Cart uses several of these patterns.

## Debugging Failed CI

Use a systematic path:

1. Identify the failed workflow, job, and step.
2. Read the first real error, not only the final exit code.
3. Check whether failure is install, test, build, package, deploy, or smoke.
4. Compare local command with the CI command.
5. Check environment variables and secrets.
6. Check generated artifacts or logs.
7. Reproduce with the closest local command.

## Common Failure Categories

Install failure:

```text
lockfile mismatch, registry issue, Node/pnpm version mismatch
```

Test failure:

```text
real behavior regression, flaky test, missing environment config
```

Build failure:

```text
TypeScript error, missing import, bad output path
```

Image failure:

```text
Dockerfile issue, missing build output, bad build arg
```

Deploy failure:

```text
missing kubeconfig, invalid manifest, bad image digest, rollout timeout
```

Smoke check failure:

```text
service deployed but public route, readiness, config, or dependency is broken
```

## Rollback Thinking

A good deployment process should make rollback possible.

Rollback options include:

- redeploy previous release manifest
- use `kubectl rollout undo`
- revert the commit and run the pipeline
- disable a feature flag
- scale down a broken worker

The best option depends on what failed.

## Strong Interview Answer

If asked "How do you make CI/CD secure and debuggable?", say:

> I scope workflow permissions, keep secrets in environment secret stores, avoid baking secrets into images, scan source and images, publish artifacts like coverage, scan reports, release manifests, and rendered Kubernetes YAML, and make failure logs available. For debugging, I isolate whether the failure is install, test, build, image, deploy, rollout, or smoke check.

## Artistry Cart Connection

Artistry Cart uses GitHub environment secrets for deployment, Trivy and pnpm audit for security checks, Codecov and artifacts for quality visibility, release manifests for traceability, and rendered Kubernetes manifests plus rollout and smoke output for deployment debugging.
