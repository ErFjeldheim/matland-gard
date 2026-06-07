import { describe, it, expect, vi, beforeEach } from 'vitest';

const { limitMock, redisFromEnv, ratelimitCtor } = vi.hoisted(() => {
  const limitMock = vi.fn();
  return {
    limitMock,
    redisFromEnv: vi.fn(() => ({ _redis: true })),
    ratelimitCtor: vi.fn().mockImplementation(() => ({
      limit: limitMock,
    })),
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation((opts) => opts ?? redisFromEnv()),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(ratelimitCtor, {
    slidingWindow: (n: number, w: string) => ({ kind: 'slidingWindow', n, w }),
  }),
}));

import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

describe('lib/ratelimit', () => {
  beforeEach(() => {
    limitMock.mockReset();
    ratelimitCtor.mockClear();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe('checkRateLimit', () => {
    it('returns noop allow when Upstash is not configured', async () => {
      const res = await checkRateLimit('1.2.3.4', { limit: 5, window: '15 m', prefix: 'login' });
      expect(res).toEqual({ allowed: true, retryAfter: 0, source: 'noop' });
      expect(ratelimitCtor).not.toHaveBeenCalled();
    });

    it('uses Upstash when both env vars are present', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
      limitMock.mockResolvedValueOnce({ success: true, reset: Date.now() + 1000 });

      const res = await checkRateLimit('1.2.3.4', { limit: 5, window: '15 m', prefix: 'login' });
      expect(res.source).toBe('upstash');
      expect(res.allowed).toBe(true);
      expect(res.retryAfter).toBe(0);
      expect(ratelimitCtor).toHaveBeenCalledTimes(1);
      expect(limitMock).toHaveBeenCalledWith('1.2.3.4');
    });

    it('rejects with retryAfter seconds when Upstash says over limit', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
      const reset = Date.now() + 30_000;
      limitMock.mockResolvedValueOnce({ success: false, reset });

      const res = await checkRateLimit('1.2.3.4', { limit: 5, window: '15 m', prefix: 'login' });
      expect(res.allowed).toBe(false);
      expect(res.retryAfter).toBeGreaterThanOrEqual(29);
      expect(res.retryAfter).toBeLessThanOrEqual(31);
    });

    it('treats missing URL as noop (partial config)', async () => {
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
      const res = await checkRateLimit('1.2.3.4', { limit: 5, window: '15 m', prefix: 'login' });
      expect(res.source).toBe('noop');
    });

    it('treats missing token as noop (partial config)', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      const res = await checkRateLimit('1.2.3.4', { limit: 5, window: '15 m', prefix: 'login' });
      expect(res.source).toBe('noop');
    });

    it('caches the limiter across calls with the same options', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
      limitMock.mockResolvedValue({ success: true, reset: Date.now() + 1000 });
      // Use unique option combos that have not been used by any earlier
      // test, otherwise the module-level `limiters` Map would already
      // hold an entry and we would see fewer constructor calls than the
      // test asserts.
      const optsA = { limit: 3, window: '5 m' as const, prefix: 'cache-a' };
      const optsB = { limit: 7, window: '7 m' as const, prefix: 'cache-b' };

      await checkRateLimit('a', optsA);
      await checkRateLimit('b', optsA);
      await checkRateLimit('c', optsB);

      expect(ratelimitCtor).toHaveBeenCalledTimes(2);
    });
  });

  describe('getClientIp', () => {
    function makeReq(headers: Record<string, string>) {
      return {
        headers: {
          get: (name: string) => headers[name.toLowerCase()] ?? null,
        },
      };
    }

    it('returns the leftmost x-forwarded-for entry', () => {
      const ip = getClientIp(makeReq({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2' }));
      expect(ip).toBe('203.0.113.7');
    });

    it('trims whitespace around the IP', () => {
      const ip = getClientIp(makeReq({ 'x-forwarded-for': '  203.0.113.7  ,10.0.0.1' }));
      expect(ip).toBe('203.0.113.7');
    });

    it('falls back to x-real-ip when x-forwarded-for is missing', () => {
      const ip = getClientIp(makeReq({ 'x-real-ip': '198.51.100.1' }));
      expect(ip).toBe('198.51.100.1');
    });

    it('returns "unknown" when no forwarded headers are present', () => {
      const ip = getClientIp(makeReq({}));
      expect(ip).toBe('unknown');
    });
  });
});
