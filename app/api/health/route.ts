import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STARTED_AT = Date.now();

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'fail'; latencyMs?: number; error?: string }> = {};
  let overallOk = true;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch (err) {
    overallOk = false;
    checks.db = {
      status: 'fail',
      latencyMs: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }

  const body = {
    status: overallOk ? 'ok' : 'fail',
    uptimeMs: Date.now() - STARTED_AT,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(body, {
    status: overallOk ? 200 : 503,
    headers: {
      'cache-control': 'no-store',
      'x-health-check': 'true',
    },
  });
}
