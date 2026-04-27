# Troubleshooting

## Install Issues

### `pnpm install` fails or produces inconsistent workspace behavior

Checks:

- confirm Node.js 20 is installed
- confirm pnpm 9 is installed
- run from the repository root
- avoid mixing npm or yarn lockfile workflows with this workspace

## Service Does Not Start

### Port already in use

Symptoms:

- service exits during startup
- Next.js reports the port is occupied

Checks:

- confirm another local process is not already using the expected port
- compare with [Port Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/11-reference/port-map.md>)

### Downstream dependency missing

Examples:

- auth or product flows fail because MongoDB is not running
- order flows fail because Redis is unavailable
- analytics flows fail because Kafka is not running
- AI Vision flows fail because AI or ImageKit keys are missing

Fix:

- start the missing dependency
- verify the matching environment variable is present

## Frontend Cannot Reach Backend

### `user-ui` requests fail

Checks:

- confirm `NEXT_PUBLIC_SERVER_URI` points to the gateway or intended backend entry point
- confirm `api-gateway` is running on `http://localhost:8080`
- confirm downstream services are running on the ports expected by the gateway

### `seller-ui` requests fail

Checks:

- confirm `NEXT_PUBLIC_SERVER_URI` is set
- confirm the service behind the target route is running

## Gateway Returns Proxy Errors

The gateway has hardcoded local proxy targets for:

- auth: `6001`
- product: `6002`
- order: `6004`
- recommendation: `6005`
- AI Vision: `6006`

If a proxy route fails:

- verify the downstream service is running on the expected port
- verify the route path matches the service route prefix
- confirm CORS or cookie expectations are not being blocked earlier in the request path

## Auth Or Cookie Issues

Checks:

- confirm `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set
- confirm `FRONTEND_URL` matches the frontend origin
- confirm `NODE_ENV` is not causing cookie security behavior you did not expect

OAuth-specific checks:

- verify provider client IDs and secrets
- verify `OAUTH_REDIRECT_BASE_URL`
- verify provider callback URLs match the local configuration

## Stripe Or Payment Failures

Checks:

- confirm `STRIPE_SECRETE_KEY` is present
- confirm `STRIPE_WEBHOOK_SECRET` is present for webhook testing
- confirm `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` is present in `user-ui`

Important note:

The current backend variable name is `STRIPE_SECRETE_KEY`, which appears to be misspelled in code. Use the variable name expected by the code unless and until the implementation is normalized.

## Email Sending Fails

Checks:

- confirm `SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_USER`, and `SMTP_PASS`
- verify the SMTP account allows the configured auth flow

## Kafka And Recommendation Issues

Checks:

- confirm Kafka is running from `libs/docker-compose.yml`
- confirm `KAFKA_BROKERS` matches the broker endpoint
- confirm `KAFKA_USER_EVENTS_TOPIC` exists or can be auto-created
- confirm `kafka-service` is running if you expect analytics ingestion to happen

## AI Vision Issues

Checks:

- confirm `GOOGLE_API_KEY`
- confirm `HUGGINGFACE_API_KEY` if the relevant feature path needs it
- confirm `IMAGEKIT_PUBLIC_API_KEY`, `IMAGEKIT_PRIVATE_API_KEY`, and `IMAGEKIT_URL_ENDPOINT`
- hit the AI Vision health endpoint and service root to confirm the service is alive

## CI/Test Failures

Checks:

- run `npx prisma generate`
- verify test env vars are present where required
- confirm MongoDB and Redis are available for e2e scenarios
- compare behavior with `.github/workflows/test.yml`

## Documentation Mismatch

If you notice docs and code disagree:

- trust the code first
- update the relevant canonical doc in `docs/`
- if the mismatch comes from older docs, note it in `legacy/`

## Related Docs

- [Environment Variables](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/environment-variables.md>)
- [Commands and Workflows](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/commands-and-workflows.md>)
