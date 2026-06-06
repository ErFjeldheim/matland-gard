import * as Sentry from "@sentry/nextjs";
import { replayIntegration } from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // 5% of browser transactions are sampled. The site is low-traffic, so
  // we still get useful performance data without paying for every pageview.
  tracesSampleRate: 0.05,

  // Capture 5% of normal sessions, 100% of sessions that hit an error.
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  // Mask all text in replay recordings by default (privacy-safe for an
  // e-commerce site with customer PII and addresses).
  integrations: [
    replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Drop noisy internal transactions from performance/quota budget.
  // The health endpoint is the UptimeRobot + Docker HEALTHCHECK target
  // and is hit every 30s; sampling it would dominate the quota.
  ignoreTransactions: ["/api/health"],

  // Don't send events in local dev — DSN may be unset and noise is unhelpful.
  enabled: Boolean(SENTRY_DSN) && process.env.NODE_ENV === "production",

  // Helpful context for the Issues feed.
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
