import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEvent,
  orderFindUnique,
  orderUpdateMany,
  processedEventFindUnique,
  processedEventCreate,
  getStripeSessionPayment,
  sendCustomerRequestReceived,
  sendCustomerCaptureReceipt,
  sendAdminOrderNotification,
} = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdateMany: vi.fn(),
  processedEventFindUnique: vi.fn(),
  processedEventCreate: vi.fn(),
  getStripeSessionPayment: vi.fn(),
  sendCustomerRequestReceived: vi.fn(),
  sendCustomerCaptureReceipt: vi.fn(),
  sendAdminOrderNotification: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: orderFindUnique, updateMany: orderUpdateMany },
    processedEvent: { findUnique: processedEventFindUnique, create: processedEventCreate },
  },
}));

vi.mock('@/lib/stripe-payments', () => ({
  getStripeSessionPayment,
}));

vi.mock('@/app/lib/vipps', () => ({
  cancelVippsPayment: vi.fn(),
  captureVippsPayment: vi.fn(),
  getVippsPayment: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendCustomerRequestReceived,
  sendCustomerCaptureReceipt,
  sendAdminOrderNotification,
}));

const ORIGINAL_ENV = { ...process.env };

const RESERVED_UNTIL = new Date('2026-11-12T00:00:00Z');

function reservedOrder(id: string) {
  return {
    id,
    status: 'requested',
    customerName: 'Ola',
    customerEmail: 'ola@example.com',
    customerPhone: '12345678',
    deliveryAddress: 'Storgata 1',
    totalAmount: 199,
    shippingMethod: 'shipping_fixed',
    orderItems: [],
  };
}

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

function checkoutEvent(id: string, orderId: string | null) {
  return {
    id,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_${id}`,
        metadata: orderId ? { orderId } : {},
      },
    },
  };
}

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    constructEvent.mockReset();
    orderFindUnique.mockReset();
    orderUpdateMany.mockReset();
    processedEventFindUnique.mockReset();
    processedEventCreate.mockReset();
    getStripeSessionPayment.mockReset();
    sendCustomerRequestReceived.mockReset();
    sendCustomerCaptureReceipt.mockReset();
    sendAdminOrderNotification.mockReset();
    // Default: every event is brand new (not yet in processed_event).
    processedEventFindUnique.mockResolvedValue(null);
    // Default: create succeeds.
    processedEventCreate.mockResolvedValue({});
    orderUpdateMany.mockResolvedValue({ count: 1 });
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

  it('marks a pending order as requested with the reserved amount and sends request emails', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_1', 'order-1'));
    orderFindUnique
      .mockResolvedValueOnce({ id: 'order-1', status: 'pending' })
      .mockResolvedValueOnce(reservedOrder('order-1'));
    getStripeSessionPayment.mockResolvedValueOnce({
      status: 'reserved',
      paymentIntentId: 'pi_1',
      amount: 199,
      captureDeadline: RESERVED_UNTIL,
    });
    sendCustomerRequestReceived.mockResolvedValueOnce(undefined);
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    expect(getStripeSessionPayment).toHaveBeenCalledWith('cs_evt_1');
    expect(orderUpdateMany).toHaveBeenCalledTimes(1);
    expect(orderUpdateMany).toHaveBeenCalledWith({
      where: { id: 'order-1', status: 'pending' },
      data: expect.objectContaining({
        status: 'requested',
        reservedAmount: 199,
        captureDeadline: RESERVED_UNTIL,
        stripePaymentIntentId: 'pi_1',
      }),
    });
    expect(sendCustomerRequestReceived).toHaveBeenCalledTimes(1);
    expect(sendAdminOrderNotification).toHaveBeenCalledTimes(1);
    expect(sendCustomerCaptureReceipt).not.toHaveBeenCalled();
  });

  it('does not change the order when Stripe has no reservation for the session', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_1b', 'order-1b'));
    orderFindUnique.mockResolvedValueOnce({ id: 'order-1b', status: 'pending' });
    getStripeSessionPayment.mockResolvedValueOnce(null);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(orderUpdateMany).not.toHaveBeenCalled();
    expect(sendCustomerRequestReceived).not.toHaveBeenCalled();
    expect(sendAdminOrderNotification).not.toHaveBeenCalled();
  });

  it('does not re-send emails when the order already left pending (idempotency)', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_2', 'order-2'));
    orderFindUnique.mockResolvedValueOnce({ id: 'order-2', status: 'requested' });

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(getStripeSessionPayment).not.toHaveBeenCalled();
    expect(orderUpdateMany).not.toHaveBeenCalled();
    expect(sendCustomerRequestReceived).not.toHaveBeenCalled();
    expect(sendAdminOrderNotification).not.toHaveBeenCalled();
  });

  it('returns 404 when the order does not exist', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_3', 'missing'));
    orderFindUnique.mockResolvedValueOnce(null);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(404);
    expect(orderUpdateMany).not.toHaveBeenCalled();
    // 404 is a permanent failure — we deliberately do NOT mark the event
    // as processed, so any operator replay would re-surface the missing
    // order until it gets resolved.
    expect(processedEventCreate).not.toHaveBeenCalled();
  });

  it('still returns 200 when email send throws (order stays requested)', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_4', 'order-3'));
    orderFindUnique
      .mockResolvedValueOnce({ id: 'order-3', status: 'pending' })
      .mockResolvedValueOnce(reservedOrder('order-3'));
    getStripeSessionPayment.mockResolvedValueOnce({
      status: 'reserved',
      paymentIntentId: 'pi_3',
      amount: 199,
      captureDeadline: RESERVED_UNTIL,
    });
    sendCustomerRequestReceived.mockRejectedValueOnce(new Error('smtp down'));
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    // The route catches email errors and still responds 200 so Stripe stops retrying.
    expect(res.status).toBe(200);
    expect(orderUpdateMany).toHaveBeenCalledTimes(1);
    // The event is still marked as processed even when email fails —
    // the reservation is in place, retries would not reserve anything new.
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
    expect(orderUpdateMany).not.toHaveBeenCalled();
  });

  it('ignores checkout.session.completed without orderId metadata', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_6', null));
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
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_7', 'order-7'));

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    // The dedup check short-circuits before any order work happens.
    expect(orderFindUnique).not.toHaveBeenCalled();
    expect(orderUpdateMany).not.toHaveBeenCalled();
    expect(sendCustomerRequestReceived).not.toHaveBeenCalled();
    // We do not re-write the row, either.
    expect(processedEventCreate).not.toHaveBeenCalled();
  });

  it('marks the event as processed after successful handling', async () => {
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_8', 'order-8'));
    orderFindUnique
      .mockResolvedValueOnce({ id: 'order-8', status: 'pending' })
      .mockResolvedValueOnce(reservedOrder('order-8'));
    getStripeSessionPayment.mockResolvedValueOnce({
      status: 'reserved',
      paymentIntentId: 'pi_8',
      amount: 199,
      captureDeadline: RESERVED_UNTIL,
    });
    sendCustomerRequestReceived.mockResolvedValueOnce(undefined);
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
    constructEvent.mockReturnValueOnce(checkoutEvent('evt_10', 'order-10'));
    orderFindUnique
      .mockResolvedValueOnce({ id: 'order-10', status: 'pending' })
      .mockResolvedValueOnce(reservedOrder('order-10'));
    getStripeSessionPayment.mockResolvedValueOnce({
      status: 'reserved',
      paymentIntentId: 'pi_10',
      amount: 199,
      captureDeadline: RESERVED_UNTIL,
    });
    const uniqueError: any = new Error('Unique constraint failed'); // eslint-disable-line @typescript-eslint/no-explicit-any
    uniqueError.code = 'P2002';
    processedEventCreate.mockRejectedValueOnce(uniqueError);
    sendCustomerRequestReceived.mockResolvedValueOnce(undefined);
    sendAdminOrderNotification.mockResolvedValueOnce(undefined);

    const { POST } = await loadRoute();
    const req = makeRequest('valid', 't=1,v1=abc');
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});
