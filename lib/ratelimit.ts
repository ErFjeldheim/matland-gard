import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the limit resets. 0 when allowed with no real limiter configured. */
  retryAfter: number;
  /** Source of the decision — useful for Sentry breadcrumbs and tests. */
  source: 'upstash' | 'noop';
};

type Limiter = {
  limit: number;
  window: `${number} ${'s' | 'm' | 'h'}`;
  prefix: string;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter({ limit, window, prefix }: Limiter): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `${prefix}:${limit}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `matland:${prefix}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Check a sliding-window rate limit.
 *
 * Falls back to a no-op (always allows) when Upstash credentials are
 * not configured. This means local dev, CI, and any environment
 * without `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` still
 * work — the only effect is that the limit is not enforced.
 */
export async function checkRateLimit(
  identifier: string,
  options: Limiter,
): Promise<RateLimitResult> {
  const limiter = getLimiter(options);
  if (!limiter) {
    return { allowed: true, retryAfter: 0, source: 'noop' };
  }
  const res = await limiter.limit(identifier);
  return {
    allowed: res.success,
    retryAfter: res.success ? 0 : Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
    source: 'upstash',
  };
}

/**
 * Extract a best-effort client IP from a Next.js Request. Behind
 * Traefik (Dokploy) the leftmost entry of `x-forwarded-for` is the
 * originating client.
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
