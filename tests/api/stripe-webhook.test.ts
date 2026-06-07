import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEvent,
  orderFindUnique,
  orderUpdate,
  processedEventFindUnique,
  processedEventCreate,
  sendCustomerOrderConfirmation,
  sendAdminOrderNotification,
} = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  processedEventFindUnique: vi.fn(),
  processedEventCreate: vi.fn(),
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
    processedEvent: { findUnique: processedEventFindUnique, create: processedEventCreate },
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
    processedEventFindUnique.mockReset();
    processedEventCreate.mockReset();
    sendCustomerOrderConfirmation.mockReset();
    sendAdminOrderNotification.mockReset();
    // Default: every event is brand new (not yet in processed_event).
    processedEventFindUnique.mockResolvedValue(null);
    // Default: create succeeds.
    processedEventCreate.mockResolvedValue({});
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const { POST } = await loadRoute();
    const req = makeRequest('{}', null);
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Webhook Error');
    expect(processedEventFindUnique).not.toHaveBeenCalled();
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
    expect(processedEventFindUnique).not.toHaveBeenCalled();
  });

  it('marks pending order as paid and sends emails on valid event', async () => {
    constructEvent.mockReturnValueOnce({
      id: 'evt_1',
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
      id: 'evt_2',
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
      id: 'evt_3',
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'missing' } } },
    });
    orderFindUnique.mockResolvedValueOnce(null);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(404);
    expect(orderUpdate).not.toHaveBeenCalled();
    // 404 is a permanent failure — we deliberately do NOT mark the event
    // as processed, so any operator replay would re-surface the missing
    // order until it gets resolved.
    expect(processedEventCreate).not.toHaveBeenCalled();
  });

  it('still returns 200 when email send throws (order is paid, not rolled back)', async () => {
    constructEvent.mockReturnValueOnce({
      id: 'evt_4',
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
    // The event is still marked as processed even when email fails —
    // the order is paid, retries would re-pay nothing, admin resends mail.
    expect(processedEventCreate).toHaveBeenCalledTimes(1);
  });

  it('returns 200 for unhandled event types', async () => {
    constructEvent.mockReturnValueOnce({
      id: 'evt_5',
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
      id: 'evt_6',
      type: 'checkout.session.completed',
      data: { object: { metadata: {} } },
    });
    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(orderFindUnique).not.toHaveBeenCalled();
  });

  it('skips processing when the event id was already processed (Stripe retry)', async () => {
    processedEventFindUnique.mockResolvedValueOnce({
      id: 'evt_7',
      type: 'checkout.session.completed',
      processedAt: new Date('2026-06-01T00:00:00Z'),
    });
    constructEvent.mockReturnValueOnce({
      id: 'evt_7',
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-7' } } },
    });

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    // The dedup check short-circuits before any order work happens.
    expect(orderFindUnique).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
    expect(sendCustomerOrderConfirmation).not.toHaveBeenCalled();
    // We do not re-write the row, either.
    expect(processedEventCreate).not.toHaveBeenCalled();
  });

  it('marks the event as processed after successful handling', async () => {
    constructEvent.mockReturnValueOnce({
      id: 'evt_8',
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-8' } } },
    });
    orderFindUnique.mockResolvedValueOnce({
      id: 'order-8',
      status: 'pending',
    });
    orderUpdate.mockResolvedValueOnce({
      id: 'order-8',
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
    expect(processedEventCreate).toHaveBeenCalledTimes(1);
    expect(processedEventCreate).toHaveBeenCalledWith({
      data: { id: 'evt_8', type: 'checkout.session.completed' },
    });
  });

  it('marks unhandled event types as processed so retries are silent', async () => {
    constructEvent.mockReturnValueOnce({
      id: 'evt_9',
      type: 'invoice.payment_failed',
      data: { object: {} },
    });
    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(processedEventCreate).toHaveBeenCalledWith({
      data: { id: 'evt_9', type: 'invoice.payment_failed' },
    });
  });

  it('tolerates a duplicate create call (concurrent retry race)', async () => {
    // First request inserted the row; a second concurrent request now
    // gets past the findUnique (stale read) and hits the unique
    // constraint. We should still return 200.
    constructEvent.mockReturnValueOnce({
      id: 'evt_10',
      type: 'checkout.session.completed',
      data: { object: { metadata: { orderId: 'order-10' } } },
    });
    orderFindUnique.mockResolvedValueOnce({
      id: 'order-10',
      status: 'pending',
    });
    orderUpdate.mockResolvedValueOnce({
      id: 'order-10',
      status: 'paid',
      customerName: 'Ola',
      customerEmail: 'ola@example.com',
      customerPhone: '12345678',
      deliveryAddress: 'Storgata 1',
      totalAmount: 199,
      shippingMethod: 'posten',
      orderItems: [],
    });
    const uniqueError: any = new Error('Unique constraint failed'); // eslint-disable-line @typescript-eslint/no-explicit-any
    uniqueError.code = 'P2002';
    processedEventCreate.mockRejectedValueOnce(uniqueError);
    sendCustomerOrderConfirmation.mockResolvedValueOnce(undefined);
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});
