# Environment Variables And Configuration

## What Is Configuration?

Configuration is data that changes between environments without changing source code.

Examples:

- database URL
- Redis URL
- Stripe secret key
- API gateway URL
- OAuth client id
- SMTP credentials
- allowed CORS origins
- feature flags
- port numbers

Code should stay mostly the same across environments. Configuration changes per environment.

## What Are Environment Variables?

Environment variables are key-value pairs provided to a running process.

Example:

```text
DATABASE_URL=mongodb://localhost:27017/artistry-cart
PORT=6001
NODE_ENV=development
```

Node.js apps read them through:

```ts
process.env.DATABASE_URL
```

## Why Environment Variables Exist

They solve several problems:

- avoid hardcoding secrets
- support different local/staging/prod settings
- make containers configurable
- keep deployment-specific data outside source code
- let CI inject test credentials

## Environments

Common environments:

### Local

Developer machine.

Example:

```text
DATABASE_URL=mongodb://localhost:27017/artistry-cart-dev
```

### Test

Used by automated tests.

Example:

```text
DATABASE_URL=mongodb://localhost:27017/artistry-cart-test
REDIS_ENABLED=false
```

### Staging

Production-like environment for validation.

### Production

Real user environment.

Uses real secrets, stricter security, HTTPS, monitoring, and stable infrastructure.

## Secrets Versus Normal Config

Secrets:

- database password
- JWT secret
- Stripe secret key
- OAuth client secret
- SMTP password

Normal config:

- port
- frontend URL
- feature flag
- log level
- allowed origin list

Secrets should not be committed to Git.

## `.env` Files

`.env` files are local files that store environment variables.

Common pattern:

```text
.env
.env.example
.env.test
```

`.env.example` should contain safe placeholder values and document required variables.

`.env` usually contains real local secrets and should be ignored by Git.

## Public Versus Server-Only Variables

Frontend frameworks often expose only variables with a public prefix.

Example in Next.js:

```text
NEXT_PUBLIC_SERVER_URI=http://localhost:8080
```

Anything public can be seen by the browser.

Never put secrets in public frontend variables.

Bad:

```text
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
```

Good:

```text
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Configuration Validation

Production apps should validate required config at startup.

Example checks:

- `DATABASE_URL` exists
- `JWT_SECRET` exists and is long enough
- `PORT` is a number
- `CORS_ALLOWED_ORIGINS` is valid

Failing fast is better than running with broken config.

## Configuration In Docker

Containers receive environment variables at runtime.

Example:

```text
docker run -e PORT=6001 -e DATABASE_URL=... auth-service
```

Docker Compose can pass variables to multiple services.

## Configuration In Kubernetes

Kubernetes commonly uses:

- ConfigMaps for non-secret config
- Secrets for sensitive config

Example:

```text
ConfigMap -> PORT, NODE_ENV, service URLs
Secret -> database password, JWT secret, Stripe key
```

## Common Config Bugs

- missing environment variable
- typo in variable name
- frontend variable not prefixed correctly
- local `.env` differs from CI config
- production secret accidentally committed
- service URL points to localhost inside a container
- staging uses production credentials
- CORS origin missing from allowed list

## Interview Explanation

If asked "Why use environment variables?", say:

> Environment variables let the same code run in different environments by injecting runtime configuration such as database URLs, ports, secrets, API keys, and feature flags. This avoids hardcoding environment-specific values and keeps secrets out of source code. In production, secrets should come from a secure secret manager or platform secret system, while non-sensitive config can come from ConfigMaps or deployment settings.

## Connection To Artistry Cart

Artistry Cart uses environment variables for:

- MongoDB connection
- Redis connection
- JWT secrets
- Stripe keys
- OAuth provider credentials
- SMTP settings
- frontend URLs
- service URLs
- CORS allowed origins
- AI provider keys

The repo includes:

```text
.env
.env.example
.env.test
docker-compose.test.yml
k8s/base/configmap.yaml
k8s/base/secrets.example.yaml
```

This is exactly why configuration needs to be understood early.

