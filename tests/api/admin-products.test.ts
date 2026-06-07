import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  productCreate,
  getUser,
} = vi.hoisted(() => ({
  productCreate: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: { create: productCreate },
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => Promise.resolve({
    auth: { getUser },
  }),
}));

import { POST } from '@/app/api/admin/products/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/admin/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/admin/products POST', () => {
  beforeEach(() => {
    productCreate.mockReset();
    getUser.mockReset();
  });

  it('returns 401 when no Supabase user is authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest({ name: 'Test', price: 100 });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
    expect(productCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when name is missing', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    const req = makeRequest({ price: 100 });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    expect(productCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when price is missing or not a number', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    const req = makeRequest({ name: 'Test', price: 'free' });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    expect(productCreate).not.toHaveBeenCalled();
  });

  it('creates the product and slugifies the name when authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    productCreate.mockResolvedValue({ id: 'p-1', name: 'Herregårds-singel', slug: 'herregards-singel' });

    const req = makeRequest({
      name: 'Herregårds-singel',
      description: 'Coarse gravel',
      price: 12500,
      image: '/img.png',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(productCreate).toHaveBeenCalledWith({
      data: {
        name: 'Herregårds-singel',
        slug: 'herregards-singel',
        description: 'Coarse gravel',
        price: 12500,
        image: '/img.png',
      },
    });
  });

  it('returns 500 on database error', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    productCreate.mockRejectedValue(new Error('db down'));
    const req = makeRequest({ name: 'Test', price: 100 });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
