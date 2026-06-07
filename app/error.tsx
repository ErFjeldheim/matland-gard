"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Noko gjekk gale</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Vi klarte ikkje å vise sida du var ute etter. Feilen er rapportert —
        du kan prøve igjen, eller gå tilbake til framsida.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Til framsida
        </Link>
      </div>
    </main>
  );
}
