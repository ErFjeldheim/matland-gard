import { NextResponse } from 'next/server';

// HEAD-only liveness probe. Distinct from /api/health (which pings the
// database) so orchestrators and uptime checks can probe the Node process
// cheaply without touching Postgres. Returns 200 as long as the process
// is up and serving requests; no body, no DB call, no auth.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'x-health-check': 'live',
    },
  });
}
