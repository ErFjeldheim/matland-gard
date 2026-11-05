/* eslint-disable @typescript-eslint/no-explicit-any -- the Stripe SDK types lag behind the pinned API version used by the rest of the app. */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
});

export type StripeSessionPayment =
  | { status: 'reserved'; paymentIntentId: string; amount: number; captureDeadline: Date | null }
  | { status: 'captured'; paymentIntentId: string; amount: number };

// Reads the Checkout Session from Stripe so the order status is never set from
// a query parameter alone. Returns null if the payment is not authorized yet.
export async function getStripeSessionPayment(sessionId: string): Promise<StripeSessionPayment | null> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  if (session.status !== 'complete' || !paymentIntentId) return null;

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });

  if (intent.status === 'requires_capture') {
    const charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    const captureBefore = charge?.payment_method_details?.card?.capture_before;

    return {
      status: 'reserved',
      paymentIntentId: intent.id,
      amount: intent.amount,
      captureDeadline: captureBefore ? new Date(captureBefore * 1000) : null,
    };
  }

  if (intent.status === 'succeeded') {
    return { status: 'captured', paymentIntentId: intent.id, amount: intent.amount_received };
  }

  return null;
}

export async function captureStripeReservation({
  paymentIntentId,
  amount,
  idempotencyKey,
}: {
  paymentIntentId: string;
  amount: number;
  idempotencyKey: string;
}): Promise<number> {
  const intent = await stripe.paymentIntents.capture(
    paymentIntentId,
    { amount_to_capture: amount },
    { idempotencyKey },
  );

  return intent.amount_received;
}

export async function getStripePaymentIntentStatus(paymentIntentId: string): Promise<string> {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status;
}

export async function cancelStripeReservation({
  paymentIntentId,
  idempotencyKey,
}: {
  paymentIntentId: string;
  idempotencyKey: string;
}): Promise<void> {
  await stripe.paymentIntents.cancel(paymentIntentId, {}, { idempotencyKey });
}

export async function refundStripePayment({
  paymentIntentId,
  amount,
  idempotencyKey,
}: {
  paymentIntentId: string;
  amount: number;
  idempotencyKey: string;
}): Promise<number> {
  const refund = await stripe.refunds.create(
    { payment_intent: paymentIntentId, amount },
    { idempotencyKey },
  );

  return refund.amount;
}
