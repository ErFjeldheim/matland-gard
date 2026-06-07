import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

console.log(
  `[sentry.server.config] loaded at ${new Date().toISOString()} dsn=${SENTRY_DSN ? SENTRY_DSN.slice(0, 30) + "..." : "MISSING"} release=${process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? "MISSING"}`,
);

Sentry.init({
  dsn: SENTRY_DSN,

  // 10% of server transactions — slightly higher than the client because
  // each server request maps 1:1 to useful backend work (DB, Stripe, email).
  tracesSampleRate: 0.1,

  // Unhandled exceptions in route handlers, server actions, and the Node
  // process are captured by default in Sentry 10. The Next.js instrumentation
  // hook (registered via withSentryConfig) wires up the App Router.

  // Drop the health endpoint from server-side performance.
  ignoreTransactions: ["/api/health"],

  enabled: Boolean(SENTRY_DSN) && process.env.NODE_ENV === "production",

  // TEMP debug to diagnose missing events in the dashboard
  debug: true,

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
