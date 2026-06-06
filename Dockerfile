FROM node:20-slim AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy Database URL for build
ENV DATABASE_URL="mysql://root:dummy@localhost:3306/dummy"

# Add dummy env vars for build to prevent API routes from failing
ENV STRIPE_SECRET_KEY=sk_test_dummy_build_key
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy_build_key

# Supabase and Deployment build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL

# Sentry build-time env. Provided as build args (so Dokploy's env can pass them
# in without baking them into the image). The Sentry Next.js plugin reads these
# to upload source maps and create a release named after the commit SHA.
# At runtime SENTRY_DSN is also read from app env (set in Dokploy app config).
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_DSN=$SENTRY_DSN

# Commit SHA (passed as build arg from Dokploy) becomes the Sentry release name
# so stack frames in the dashboard can be resolved to the right commit.
ARG COMMIT_SHA
ENV NEXT_PUBLIC_SENTRY_RELEASE=$COMMIT_SHA

RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
