import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const { setCookie, cookieGet } = vi.hoisted(() => ({
  setCookie: vi.fn(),
  cookieGet: vi.fn(),
}));

vi.hoisted(() => {
  process.env.ADMIN_PASSWORD = 'correct-horse';
});

vi.mock('next/headers', () => ({
  cookies: () => ({
    set: setCookie,
    get: cookieGet,
  }),
}));

import { POST } from '@/app/api/admin/login/route';

describe('/api/admin/login', () => {
  beforeAll(() => {
    process.env.ADMIN_PASSWORD = 'correct-horse';
  });

  beforeEach(() => {
    setCookie.mockReset();
    cookieGet.mockReset();
  });

  it('returns 200 and sets httpOnly cookie on correct password', async () => {
    const req = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'correct-horse' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
    expect(setCookie).toHaveBeenCalledTimes(1);
    const [name, value, options] = setCookie.mock.calls[0];
    expect(name).toBe('admin-auth');
    expect(value).toBe('authenticated');
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(options.maxAge).toBe(60 * 60 * 24 * 7);
    expect(options.secure).toBe(process.env.NODE_ENV === 'production');
  });

  it('returns 401 on wrong password and does not set a cookie', async () => {
    const req = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ error: 'Feil passord' });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('returns 500 on malformed JSON', async () => {
    const req = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
