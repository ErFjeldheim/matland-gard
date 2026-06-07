import { describe, it, expect, vi, beforeEach } from 'vitest';

const { constructEvent, orderFindUnique, orderUpdate, sendCustomerOrderConfirmation, sendAdminOrderNotification } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  sendCustomerOrderConfirmation: vi.fn(),
  sendAdminOrderNotification: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: orderFindUnique, update: orderUpdate },
  },
}));

vi.mock('@/lib/email', () => ({
  sendCustomerOrderConfirmation,
  sendAdminOrderNotification,
}));

const ORIGINAL_ENV = { ...process.env };

async function loadRoute() {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
  vi.resetModules();
  return import('@/app/api/webhooks/stripe/route');
}

function makeRequest(body: string, signature: string | null) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (signature) headers['stripe-signature'] = signature;
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body,
  });
}

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    constructEvent.mockReset();
    orderFindUnique.mockReset();
    orderUpdate.mockReset();
    sendCustomerOrderConfirmation.mockReset();
    sendAdminOrderNotification.mockReset();
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const { POST } = await loadRoute();
    const req = makeRequest('{}', null);
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Webhook Error');
  });

  it('returns 400 when signature is invalid', async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature');
    });
    const { POST } = await loadRoute();
    const req = makeRequest('{"id":"evt_x","type":"checkout.session.completed"}', 'bad-sig');
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/No signatures/);
  });

  it('marks pending order as paid and sends emails on valid event', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-1' } } },
    });
    orderFindUnique.mockResolvedValueOnce({
      id: 'order-1',
      status: 'pending',
    });
    orderUpdate.mockResolvedValueOnce({
      id: 'order-1',
      status: 'paid',
      customerName: 'Ola',
      customerEmail: 'ola@example.com',
      customerPhone: '12345678',
      deliveryAddress: 'Storgata 1',
      totalAmount: 199,
      shippingMethod: 'posten',
      orderItems: [],
    });
    sendCustomerOrderConfirmation.mockResolvedValueOnce(undefined);
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    expect(orderUpdate).toHaveBeenCalledTimes(1);
    expect(orderUpdate).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'paid' },
      include: { orderItems: { include: { product: true } } },
    });
    expect(sendCustomerOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(sendAdminOrderNotification).toHaveBeenCalledTimes(1);
  });

  it('does not re-send emails when order is already paid (idempotency)', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-2' } } },
    });
    orderFindUnique.mockResolvedValueOnce({
      id: 'order-2',
      status: 'paid',
    });

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(orderUpdate).not.toHaveBeenCalled();
    expect(sendCustomerOrderConfirmation).not.toHaveBeenCalled();
    expect(sendAdminOrderNotification).not.toHaveBeenCalled();
  });

  it('returns 404 when the order does not exist', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'missing' } } },
    });
    orderFindUnique.mockResolvedValueOnce(null);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(404);
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it('still returns 200 when email send throws (order is paid, not rolled back)', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-3' } } },
    });
    orderFindUnique.mockResolvedValueOnce({
      id: 'order-3',
      status: 'pending',
    });
    orderUpdate.mockResolvedValueOnce({
      id: 'order-3',
      status: 'paid',
      customerName: 'Ola',
      customerEmail: 'ola@example.com',
      customerPhone: '12345678',
      deliveryAddress: 'Storgata 1',
      totalAmount: 199,
      shippingMethod: 'posten',
      orderItems: [],
    });
    sendCustomerOrderConfirmation.mockRejectedValueOnce(new Error('smtp down'));
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    // The route catches email errors and still responds 200 so Stripe stops retrying.
    expect(res.status).toBe(200);
    expect(orderUpdate).toHaveBeenCalledTimes(1);
  });

  it('returns 200 for unhandled event types', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'invoice.payment_failed',
      data: { object: {} },
    });
    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(orderFindUnique).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it('ignores checkout.session.completed without orderId metadata', async () => {
    constructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: {} } },
    });
    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(orderFindUnique).not.toHaveBeenCalled();
  });
});
