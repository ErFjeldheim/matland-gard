import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// DEBUG-ONLY endpoint to verify the Sentry integration end-to-end.
// Captures an exception, calls flush(3000) to wait for transport delivery,
// and returns a JSON body with diagnostic state so the caller can verify
// the SDK initialised, the DSN was loaded, and the event was actually
// accepted by the transport.
//
// Remove this file once verification is done. Only kept in prod for the
// one-time smoke test.
//
//   curl -X POST https://matlandgard.no/api/debug/sentry-test
//
// Expected: HTTP 500 with body containing sent:true, flushed:true and a
// 32-char eventId. On the Sentry dashboard for fjelldata /
// javascript-nextjs: a new "SentryTestError" issue with that eventId.

export async function POST() {
  const dsn = process.env.SENTRY_DSN;
  const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
  const nodeEnv = process.env.NODE_ENV;

  const client = Sentry.getCurrentHub().getClient();

  const eventId = Sentry.captureException(
    new Error("SentryTestError: verification from /api/debug/sentry-test"),
  );

  // flush(3000) waits up to 3s for pending events to be sent over the
  // network. Returns true if the queue drained within the timeout.
  const flushed = await Sentry.flush(3000);

  return NextResponse.json(
    {
      error: "sentry test",
      eventId: String(eventId),
      flushed,
      sdk: {
        initialised: Boolean(client),
        dsn: client?.getDsn()?.toString() ?? null,
        environment: client?.getOptions()?.environment ?? null,
        release: client?.getOptions()?.release ?? null,
        enabled: client?.getOptions()?.enabled ?? null,
        tracesSampleRate: client?.getOptions()?.tracesSampleRate ?? null,
      },
      env: {
        dsnSet: Boolean(dsn),
        dsnPrefix: dsn ? `${dsn.slice(0, 30)}...` : null,
        release,
        nodeEnv,
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  return POST();
}
