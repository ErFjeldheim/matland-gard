import { describe, it, expect, vi, beforeEach } from 'vitest';

const { $queryRaw } = vi.hoisted(() => ({ $queryRaw: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw },
}));

import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  beforeEach(() => {
    $queryRaw.mockReset();
  });

  it('returns 200 and ok status when DB is reachable', async () => {
    $queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.checks.db.status).toBe('ok');
    expect(typeof body.checks.db.latencyMs).toBe('number');
    expect(typeof body.uptimeMs).toBe('number');
    expect(typeof body.timestamp).toBe('string');
    expect(body.nodeVersion).toBe(process.version);
  });

  it('returns 503 and fail status when DB throws', async () => {
    $queryRaw.mockRejectedValueOnce(new Error('connection refused'));
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('fail');
    expect(body.checks.db.status).toBe('fail');
    expect(body.checks.db.error).toContain('connection refused');
  });

  it('sets cache-control no-store', async () => {
    $queryRaw.mockResolvedValueOnce([]);
    const res = await GET();
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
