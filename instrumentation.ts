import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const onRequestError = Sentry.captureRequestError;
    if (onRequestError) {
      // Next.js 15+ forwards server-side errors to this hook so Sentry can
      // group them with the original request context.
      console.log("[instrumentation] captureRequestError wired");
    }
  }
}
