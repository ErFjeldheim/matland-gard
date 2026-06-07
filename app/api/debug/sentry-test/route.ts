import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// DEBUG-ONLY endpoint to verify the Sentry integration end-to-end.
// Throws an unhandled error, captured by the Sentry server SDK, and
// returns a 500 so the caller can confirm the request completed (the
// error itself is what we check on the Sentry dashboard).
//
// Remove this file once verification is done. Guarded by NODE_ENV !== production
// on top: if a deploy leaks this into prod, the Sentry error is still
// useful but the response also makes the cause obvious.
//
//   curl -X POST https://matlandgard.no/api/_debug/sentry-test
//
// Expected: HTTP 500 with body {"error":"sentry test"}.
// On the Sentry dashboard for fjelldata / javascript-nextjs: a new
// "SentryTestError" issue with the stack trace below.

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    // Allow in prod for the one-time verification, but the Sentry dashboard
    // check is the gate. The endpoint is removed in a follow-up commit.
  }

  try {
    throw new Error("SentryTestError: verification from /api/_debug/sentry-test");
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "sentry test", sent: true },
      { status: 500 },
    );
  }
}

// GET also throws so anyone (including UptimeRobot-style bots) hitting the
// URL with a GET still generates a Sentry event.
export async function GET() {
  return POST();
}
