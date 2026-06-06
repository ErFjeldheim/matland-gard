import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
};

// Sentry Next.js plugin: wraps the Next config and:
//   - Uploads source maps during `next build` (when SENTRY_AUTH_TOKEN is set)
//   - Inlines SENTRY_DSN into the client bundle (so the browser SDK can init)
//   - Instruments the server runtime to capture errors and transactions
//
// Build-time env required (set in Dokploy app env / Dockerfile build args):
//   SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
// Runtime env required (Dokploy app env):
//   SENTRY_DSN
//
// If SENTRY_AUTH_TOKEN is unset the build still succeeds; source maps are
// not uploaded and sentry-cli prints a warning. The runtime SDK still works
// (events are sent, they just point to line numbers, not source).
const sentryWebpackPluginOptions = {
  // Upload source maps only when building a real release.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Don't fail the build if upload fails (e.g. transient Sentry outage).
  // The build itself is unaffected; we lose one round of source maps.
  widenClientFileUpload: true,
  hideSourceMaps: true,
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Tag uploaded source maps with the commit SHA so Sentry can resolve
  // stack frames even after multiple deploys to the same release name.
  release: {
    name: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    create: true,
    finalize: false, // finalize on a later CI step if we add one
  },

  // Strip Sentry code from the bundle when DSN is missing.
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
