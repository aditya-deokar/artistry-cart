# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20
ARG PNPM_VERSION=9.15.0

FROM node:${NODE_VERSION}-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

ARG APP_NAME
RUN pnpm exec nx build ${APP_NAME} --configuration=production

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV NODE_ENV=production
ENV HOST=0.0.0.0

ARG PNPM_VERSION=9.15.0
ARG APP_PORT=3000
ARG BUILD_OUTPUT

ENV PORT=${APP_PORT}

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=builder --chown=node:node /workspace/${BUILD_OUTPUT}/ ./

RUN --mount=type=cache,id=pnpm-store-runtime,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

USER node

CMD ["node", "main.js"]
