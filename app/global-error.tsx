"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="no">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Noko gjekk gale</h1>
          <p className="mt-2 text-gray-600">
            Vi har fått beskjed om feilen og jobbar med å fikse det.
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Prøv igjen
          </button>
        </main>
      </body>
    </html>
  );
}
