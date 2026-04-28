# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20
ARG PNPM_VERSION=9.15.0

FROM node:${NODE_VERSION}-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

ARG NEXT_PUBLIC_SERVER_URI=http://localhost:8080
ARG INTERNAL_SERVER_URI=http://localhost:8080
ARG NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
ARG NEXT_PUBLIC_AI_VISION_API_URL=http://localhost:8080/ai-vision/api/v1/ai
ARG NEXT_PUBLIC_USER_UI_LINK=http://localhost:3000
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY=

ENV NEXT_PUBLIC_SERVER_URI=${NEXT_PUBLIC_SERVER_URI}
ENV INTERNAL_SERVER_URI=${INTERNAL_SERVER_URI}
ENV NEXT_PUBLIC_FRONTEND_URL=${NEXT_PUBLIC_FRONTEND_URL}
ENV NEXT_PUBLIC_AI_VISION_API_URL=${NEXT_PUBLIC_AI_VISION_API_URL}
ENV NEXT_PUBLIC_USER_UI_LINK=${NEXT_PUBLIC_USER_UI_LINK}
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

ARG APP_NAME
ARG APP_ROOT
ARG OUTPUT_ROOT

RUN pnpm exec nx build ${APP_NAME} --configuration=production

RUN mkdir -p /workspace/.docker-output/standalone \
    /workspace/.docker-output/static \
    /workspace/.docker-output/public \
    && cp -R /workspace/${OUTPUT_ROOT}/.next/standalone/. /workspace/.docker-output/standalone/ \
    && cp -R /workspace/${OUTPUT_ROOT}/.next/static/. /workspace/.docker-output/static/ \
    && if [ -d "/workspace/${APP_ROOT}/public" ]; then cp -R /workspace/${APP_ROOT}/public/. /workspace/.docker-output/public/; fi

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

ARG APP_PORT=3000

ENV PORT=${APP_PORT}

WORKDIR /app

COPY --from=builder --chown=node:node /workspace/.docker-output/standalone/ ./
COPY --from=builder --chown=node:node /workspace/.docker-output/static/ ./.next/static/
COPY --from=builder --chown=node:node /workspace/.docker-output/public/ ./public/

USER node

CMD ["node", "server.js"]
