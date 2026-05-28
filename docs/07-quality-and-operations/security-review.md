# Security Review

## Overview

The security posture is stronger after Phase 6 than it was during the initial repo audit.

The codebase now combines application-level protections with platform-level hardening in Kubernetes and CI, but it is still a baseline, not a finished enterprise security program.

## Current Strengths

### Auth and session protections

- shared backend auth middleware verifies JWTs
- protected routes load the current account from the database
- seller and admin routes use explicit role guards
- auth cookies use production-aware `httpOnly`, `secure`, and `sameSite` settings

### OAuth protections

The OAuth layer uses Arctic with:

- generated state values
- generated code verifiers

That is a solid PKCE and CSRF-conscious baseline.

### Stripe webhook verification

`order-service` still follows the correct Stripe pattern:

- reads the raw request body
- extracts `stripe-signature`
- verifies the event with `constructEvent`

### Rate limiting

Visible rate limiting exists in:

- `api-gateway` via `express-rate-limit`
- `aivision-service` via MongoDB-backed per-endpoint controls

The gateway policy is now env-driven instead of assuming request auth state in the rate-limit key logic.

### Security headers

Baseline security headers are now applied in two places:

- Express services through the shared runtime middleware
- Next.js frontends through `next.config.js` response headers

Current baseline headers include:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

### Kubernetes hardening

The Kubernetes baseline already includes:

- non-root container execution
- dropped Linux capabilities
- disabled privilege escalation
- runtime-default seccomp profile
- baseline `NetworkPolicy` objects

### Supply-chain security

Phase 6 added:

- Trivy image and filesystem scanning
- a scheduled nightly security workflow
- Dependabot for npm and GitHub Actions updates
- SBOM and provenance generation in the release pipeline

## Security Gaps And Inconsistencies

### Secrets management is still baseline only

The repo uses env files locally and Kubernetes `Secret` manifests by pattern, but it does not yet include:

- an external secret manager
- rotation workflow automation
- per-service secret ownership boundaries

### Validation is still uneven

AI Vision has the strongest centralized validation posture. Other backend services still rely more on controller-level behavior and less on a shared validation standard.

### Security headers are not yet a full browser hardening policy

The new headers are a good start, but there is still no documented or enforced baseline for:

- Content Security Policy
- Permissions Policy
- HSTS strategy at the ingress layer

### Naming inconsistencies still increase ops risk

Examples include:

- `STRIPE_SECRETE_KEY`

Typos in configuration names create operational mistakes during deployment and secret rotation.

## Additional Risks To Track

- no centralized audit-log or security-event pipeline yet
- no image signing yet
- no admission-policy enforcement such as Kyverno or OPA Gatekeeper yet
- no external secret manager integration yet
- egress restrictions are not yet defined in Kubernetes network policy

## Overall Assessment

The current posture is best described as:

- solid baseline safeguards
- meaningful platform hardening progress
- still missing centralized secrets, signing, and policy enforcement

## Interview Framing

A strong answer here is:

- the repo now has both app-level and platform-level security controls
- the next maturity step is secret management, policy enforcement, and continuous security operations
