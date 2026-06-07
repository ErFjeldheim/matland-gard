import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// DEBUG-ONLY endpoint to verify the Sentry integration end-to-end.
// Throws a SentryTestError, captured by Sentry.captureException, and
// returns a 500 with diagnostic state so the caller can verify the
// SDK was initialised, the env vars reached the process, and the event
// was actually flushed to Sentry.
//
// Remove this file once verification is done.
//
//   curl -X POST https://matlandgard.no/api/debug/sentry-test
//
// Expected: HTTP 500 with body containing sent:true and eventId.

export async function POST() {
  const dsn = process.env.SENTRY_DSN;
  const eventId = Sentry.captureException(
    new Error("SentryTestError: verification from /api/debug/sentry-test"),
  );
  await Sentry.flush(3000);
  return NextResponse.json(
    {
      error: "sentry test",
      eventId: String(eventId),
      env: {
        dsnSet: Boolean(dsn),
        dsnPrefix: dsn ? `${dsn.slice(0, 30)}...` : null,
        release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
        nodeEnv: process.env.NODE_ENV,
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  return POST();
}
