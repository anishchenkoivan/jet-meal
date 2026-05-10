FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/opentelemetry/package.json packages/opentelemetry/
COPY packages/ui-lib/package.json         packages/ui-lib/
COPY packages/restaurant-ui/package.json  packages/restaurant-ui/
COPY services/auth-ssr/package.json       services/auth-ssr/
COPY services/delivery-ssr/package.json   services/delivery-ssr/
COPY services/restaurant-ssr/package.json services/restaurant-ssr/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ── builder ───────────────────────────────────────────────────────────────────
FROM deps AS builder
ARG SERVICE_NAME

COPY tsconfig.checks.json tsconfig.ssr.json tsconfig.esm-package.json ./
COPY packages/ packages/
COPY services/ services/

RUN pnpm --filter "@jet-meal/${SERVICE_NAME}" build \
 && mkdir -p services/${SERVICE_NAME}/public

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
ARG SERVICE_NAME
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SERVICE_NAME=${SERVICE_NAME}

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs \
  /app/services/${SERVICE_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs \
  /app/services/${SERVICE_NAME}/.next/static \
  ./services/${SERVICE_NAME}/.next/static
COPY --from=builder --chown=nextjs:nodejs \
  /app/services/${SERVICE_NAME}/public \
  ./services/${SERVICE_NAME}/public

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "node services/$SERVICE_NAME/server.js"]
