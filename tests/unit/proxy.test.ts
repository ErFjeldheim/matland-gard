import { describe, it, expect, vi } from 'vitest';

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

function makeRequest(pathname: string, cookieValue?: string): any { // eslint-disable-line @typescript-eslint/no-explicit-any
    const url = new URL(`https://example.test${pathname}`);
    const cookies: Record<string, { value: string }> = {};
    if (cookieValue !== undefined) {
        cookies['admin-auth'] = { value: cookieValue };
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
            get: (name: string) => cookies[name],
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
    it('lets authenticated requests through', () => {
        clearChain();
        const req = makeRequest('/admin/orders', 'authenticated');
        const res = proxy(req);
        expect(nextMock.NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ kind: 'next' });
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

    it('rejects an unauthenticated request with the wrong cookie value', () => {
        clearChain();
        const req = makeRequest('/admin/orders', 'something-else');
        proxy(req);
        expect(nextMock.NextResponse.redirect).toHaveBeenCalled();
    });
});

describe('proxy matcher config', () => {
    it('excludes /admin/login from the page matcher', () => {
        expect(config.matcher).toContain('/admin/((?!login$).*)');
    });

    it('excludes login, logout, and check-auth from the api matcher', () => {
        expect(config.matcher).toContain('/api/admin/((?!login|logout|check-auth$).*)');
    });
});
