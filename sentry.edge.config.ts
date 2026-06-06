import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // 10% of edge transactions (middleware, edge route handlers).
  tracesSampleRate: 0.1,

  ignoreTransactions: ["/api/health"],

  enabled: Boolean(SENTRY_DSN) && process.env.NODE_ENV === "production",

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
