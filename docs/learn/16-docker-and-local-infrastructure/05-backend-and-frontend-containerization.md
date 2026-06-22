# Backend And Frontend Containerization

## Backend Containerization

Backend services are Node.js processes.

Artistry Cart uses:

```text
docker/backend.Dockerfile
```

It is parameterized with build args such as:

- `APP_NAME`
- `BUILD_OUTPUT`
- `APP_PORT`
- `NODE_VERSION`
- `PNPM_VERSION`

## Backend Build Flow

High-level flow:

```text
builder stage
  -> install pnpm
  -> copy repo
  -> pnpm install
  -> prisma generate
  -> nx build APP_NAME

runtime stage
  -> copy built output
  -> install production deps
  -> run as node user
  -> node main.js
```

This is a multi-stage build.

## Backend Image Benefits

Benefits:

- same packaging pattern for multiple services
- app selected by build args
- production runtime separate from build stage
- non-root runtime user
- Node 20/pnpm consistency

## Frontend Containerization

Frontend apps are Next.js apps.

Artistry Cart uses:

```text
docker/frontend.Dockerfile
```

It builds Next.js output and copies standalone/static/public assets into runtime image.

## Frontend Build Args

Frontend build args include public/runtime URL configuration such as:

- `NEXT_PUBLIC_SERVER_URI`
- `INTERNAL_SERVER_URI`
- `NEXT_PUBLIC_FRONTEND_URL`
- `NEXT_PUBLIC_AI_VISION_API_URL`
- `NEXT_PUBLIC_USER_UI_LINK`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

Important:

> Anything `NEXT_PUBLIC_*` can be exposed to the browser. Do not put secrets there.

## Next.js Standalone Output

Next.js standalone output packages only what is needed to run the server.

Runtime command:

```text
node server.js
```

This helps keep frontend runtime images smaller and cleaner.

## Backend Versus Frontend Runtime

Backend:

```text
node main.js
```

Frontend:

```text
node server.js
```

Both run Node.js, but build outputs differ.

## Interview Explanation

If asked "How would you containerize Node backend and Next frontend?", say:

> I would use multi-stage Dockerfiles. The builder stage installs dependencies and builds the app. The runtime stage copies only the build output and production dependencies, sets production environment variables, runs as a non-root user, exposes the needed port, and starts the Node process. For Next.js, I would use standalone output where possible.

## Connection To Artistry Cart

Artistry Cart's Dockerfiles support packaging many Nx projects with shared build patterns:

- backend services through `backend.Dockerfile`
- `user-ui` and `seller-ui` through `frontend.Dockerfile`
- app-specific values passed through build args

