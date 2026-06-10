# Docker Image Build, Scan, Publish, And Release Manifest

## Why CI Builds Images

Tests prove source code behavior.

Docker images prove deployable packaging.

A service is not truly ready for Kubernetes until its image can be built, tagged, scanned, pushed, and referenced by deployment manifests.

## Buildx

Docker Buildx is an advanced Docker build tool.

Artistry Cart uses:

```text
docker/setup-buildx-action
docker/build-push-action
```

This supports modern image build features such as build cache, provenance, and SBOM generation.

## GitHub Container Registry

Artistry Cart publishes images to GitHub Container Registry:

```text
ghcr.io/<owner>/artistry-cart-<app>
```

Examples:

- `artistry-cart-user-ui`
- `artistry-cart-api-gateway`
- `artistry-cart-auth-service`
- `artistry-cart-kafka-service`

## Image Tags

Image tags are human-readable references.

The build workflow uses:

- SHA tags
- Git tag references
- `master` tag for the master branch

Tags are useful, but image digests are more precise.

## Image Digest

An image digest is a content-addressed immutable reference.

Example shape:

```text
sha256:<hash>
```

Using digests in deployment improves traceability because the deployment points to the exact image content, not a mutable tag.

## Build Args

The build workflow passes build args based on app type.

For backend apps, it passes:

- app name
- app port
- build output

For frontend apps, it also passes public runtime-related values such as frontend URLs and public API URLs.

Important rule:

```text
never bake sensitive secrets into Docker images
```

Secrets should be runtime environment values, not image build args.

## Image Scanning

Artistry Cart scans published images with Trivy.

The scan checks:

- operating system vulnerabilities
- library vulnerabilities
- high and critical severity findings

The workflow uploads SARIF results to GitHub Security and uploads scan artifacts.

This gives visibility even when the pipeline is configured not to fail on every finding.

## SBOM And Provenance

The image build step enables:

```text
provenance: true
sbom: true
```

An SBOM is a software bill of materials. It describes what is inside the built artifact.

Provenance records build metadata, helping answer where an artifact came from.

## Release Image Record

For each image, the workflow writes a JSON record containing:

- app name
- app type
- port
- Dockerfile
- build output
- repository
- digest
- tags
- publish time

This turns image publishing into structured data.

## Release Manifest

The workflow merges image records into:

```text
release-image-manifest.json
```

That manifest becomes the bridge between:

```text
image publishing -> Kubernetes deployment
```

Deploy workflows download this artifact and use it to update Kustomize image references.

## Strong Interview Answer

If asked "How do you build and publish images in CI?", say:

> After tests and builds pass, CI selects deployable apps, builds Docker images with Buildx, tags them by commit or release, pushes them to a registry, scans them for vulnerabilities, records the immutable image digest, and publishes a release manifest. Deployment should consume digests from that manifest so the exact artifact is traceable.

## Artistry Cart Connection

Artistry Cart uses `.github/workflows/build-publish.yml` to validate the repo, run e2e checks, select deployable apps, build images with Docker Buildx, publish them to GHCR, scan with Trivy, and upload a release image manifest for deployment workflows.
