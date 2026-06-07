import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pbufcmuofitrtwckuqtr.supabase.co';
});

// Stub next/server with a minimal implementation that captures the
// proxy's return value so we can assert on status, headers, and
// the redirect target without spinning up the full Next.js runtime.
const nextMock = vi.hoisted(() => {
    const chain: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
        chain,
        NextResponse: {
            next: vi.fn(() => {
                const r = { kind: 'next' };
                chain.push(r);
                return r;
            }),
            redirect: vi.fn((url: URL | string) => {
                const r = { kind: 'redirect', url: url.toString() };
                chain.push(r);
                return r;
            }),
            json: vi.fn((body: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
                const r = { kind: 'json', body, status: init?.status ?? 200, headers: init?.headers ?? {} };
                chain.push(r);
                return r;
            }),
        },
    };
});

vi.mock('next/server', () => ({
    NextResponse: nextMock.NextResponse,
}));

import { proxy, config } from '@/proxy';

function makeRequest(pathname: string, cookieNames: string[] = []): any { // eslint-disable-line @typescript-eslint/no-explicit-any
    const url = new URL(`https://example.test${pathname}`);
    const cookies = new Map<string, { value: string }>();
    for (const name of cookieNames) {
        cookies.set(name, { value: 'mock-value' });
    }
    const nextUrl = {
        pathname: url.pathname,
        search: url.search,
        href: url.href,
        host: url.host,
        protocol: url.protocol,
        port: url.port,
        origin: url.origin,
        toString() {
            return `https://example.test${this.pathname}${this.search}`;
        },
        clone() {
            return {
                pathname: this.pathname,
                search: this.search,
                href: this.href,
                host: this.host,
                protocol: this.protocol,
                port: this.port,
                origin: this.origin,
                toString: this.toString,
                clone: this.clone,
            };
        },
    };
    return {
        nextUrl,
        cookies: {
            getAll: () =>
                Array.from(cookies.entries()).map(([name, value]) => ({
                    name,
                    value: value.value,
                })),
        },
    };
}

function clearChain() {
    nextMock.chain.length = 0;
    vi.mocked(nextMock.NextResponse.next).mockClear();
    vi.mocked(nextMock.NextResponse.redirect).mockClear();
    vi.mocked(nextMock.NextResponse.json).mockClear();
}

describe('proxy', () => {
    beforeAll(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pbufcmuofitrtwckuqtr.supabase.co';
    });

    it('lets authenticated requests through when the Supabase auth cookie is present', () => {
        clearChain();
        const req = makeRequest('/admin/orders', ['sb-pbufcmuofitrtwckuqtr-auth-token']);
        const res = proxy(req);
        expect(nextMock.NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ kind: 'next' });
    });

    it('lets requests through when chunked Supabase auth cookies are present', () => {
        clearChain();
        const req = makeRequest('/admin/orders', [
            'sb-pbufcmuofitrtwckuqtr-auth-token-0',
            'sb-pbufcmuofitrtwckuqtr-auth-token-1',
        ]);
        proxy(req);
        expect(nextMock.NextResponse.next).toHaveBeenCalled();
    });

    it('redirects unauthenticated /admin/* to /admin/login', () => {
        clearChain();
        const req = makeRequest('/admin/orders/123');
        const res = proxy(req);
        expect(nextMock.NextResponse.redirect).toHaveBeenCalled();
        const arg = vi.mocked(nextMock.NextResponse.redirect).mock.calls[0]?.[0];
        expect(String(arg)).toContain('/admin/login');
        expect(res).toEqual({ kind: 'redirect', url: expect.stringContaining('/admin/login') });
    });

    it('returns 401 JSON for unauthenticated /api/admin/*', () => {
        clearChain();
        const req = makeRequest('/api/admin/products');
        const res = proxy(req);
        expect(nextMock.NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 },
        );
        expect(res).toEqual({ kind: 'json', body: { error: 'Unauthorized' }, status: 401, headers: {} });
    });

    it('rejects a request whose cookies do not include a Supabase auth cookie', () => {
        clearChain();
        const req = makeRequest('/admin/orders', ['some-other-cookie', 'session=abc']);
        proxy(req);
        expect(nextMock.NextResponse.redirect).toHaveBeenCalled();
    });

    it('rejects a request whose cookie name is from a different Supabase project', () => {
        clearChain();
        const req = makeRequest('/admin/orders', ['sb-some-other-project-auth-token']);
        proxy(req);
        expect(nextMock.NextResponse.redirect).toHaveBeenCalled();
    });
});

describe('proxy matcher config', () => {
    it('excludes /admin/login from the page matcher', () => {
        expect(config.matcher).toContain('/admin/((?!login$).*)');
    });

    it('matches all /api/admin routes', () => {
        expect(config.matcher).toContain('/api/admin/(.*)');
    });
});
