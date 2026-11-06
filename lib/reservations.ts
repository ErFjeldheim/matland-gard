import { prisma } from '@/lib/prisma';
import {
  cancelVippsPayment,
  captureVippsPayment,
  getVippsPayment,
  refundVippsPayment,
} from '@/app/lib/vipps';
import {
  cancelStripeReservation,
  captureStripeReservation,
  getStripePaymentIntentStatus,
  refundStripePayment,
} from '@/lib/stripe-payments';
import {
  sendAdminOrderNotification,
  sendCustomerCaptureReceipt,
  sendCustomerRequestReceived,
} from '@/lib/email';

type ReservationOrder = {
  id: string;
  paymentMethod: string | null;
  totalAmount: number;
  reservedAmount: number | null;
  vippsReference: string | null;
  stripePaymentIntentId: string | null;
};

type EmailOrder = Parameters<typeof sendCustomerRequestReceived>[0];

export type ReservedPayment = {
  reservedAmount: number; // in øre
  captureDeadline: Date | null;
  stripePaymentIntentId?: string;
  vippsReference?: string;
  // True when the payment was already captured at the provider (for example a
  // Stripe payment created before manual capture was enabled).
  captured?: boolean;
  // Exact captured amount when the provider reports one.
  capturedAmount?: number;
};

export function vippsReferenceFor(order: Pick<ReservationOrder, 'id' | 'vippsReference'>): string {
  return order.vippsReference ?? order.id;
}

// Only the first caller moves the order out of `pending`, so the Stripe webhook
// and the success page cannot both mark the same order as requested.
export async function markReserved(orderId: string, payment: ReservedPayment) {
  const now = new Date();

  const result = await prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: {
      status: payment.captured ? 'paid' : 'requested',
      reservedAmount: payment.reservedAmount,
      captureDeadline: payment.captureDeadline,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      vippsReference: payment.vippsReference,
      capturedAmount: payment.captured
        ? (payment.capturedAmount ?? payment.reservedAmount)
        : undefined,
      capturedAt: payment.captured ? now : undefined,
    },
  });

  if (result.count === 0) return null;

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function sendReservationEmails(order: EmailOrder) {
  if (order.status === 'paid') {
    await Promise.all([sendCustomerCaptureReceipt(order), sendAdminOrderNotification(order)]);
    return;
  }

  await Promise.all([sendCustomerRequestReceived(order), sendAdminOrderNotification(order)]);
}

// True when the provider has already let go of the funds, for example because
// the Stripe hold expired. Cancelling again would fail, but the goal is met.
async function isReservationAlreadyReleased(order: ReservationOrder): Promise<boolean> {
  if (order.paymentMethod === 'stripe' && order.stripePaymentIntentId) {
    return (await getStripePaymentIntentStatus(order.stripePaymentIntentId)) === 'canceled';
  }

  if (order.paymentMethod === 'vipps') {
    const details = await getVippsPayment(vippsReferenceFor(order));
    const aggregate = details.aggregate;
    if (!aggregate) return false;

    return (
      aggregate.cancelledAmount.value + aggregate.capturedAmount.value >=
      aggregate.authorizedAmount.value
    );
  }

  return false;
}

export async function releaseReservation(order: ReservationOrder): Promise<void> {
  const idempotencyKey = `release-${order.id}`;

  try {
    if (order.paymentMethod === 'stripe') {
      if (!order.stripePaymentIntentId) {
        throw new Error('Mangler Stripe-referanse for reservasjonen');
      }
      await cancelStripeReservation({ paymentIntentId: order.stripePaymentIntentId, idempotencyKey });
      return;
    }

    if (order.paymentMethod === 'vipps') {
      await cancelVippsPayment({ reference: vippsReferenceFor(order), idempotencyKey });
      return;
    }

    throw new Error('Ukjent betalingsmetode');
  } catch (error) {
    const alreadyReleased = await isReservationAlreadyReleased(order).catch(() => false);
    if (alreadyReleased) {
      console.warn(`Reservation for order ${order.id} was already released at the provider`);
      return;
    }
    throw error;
  }
}

// Captures the full reserved amount. Returns the captured amount in øre.
export async function captureReservation(order: ReservationOrder): Promise<number> {
  const amount = order.reservedAmount ?? order.totalAmount;
  const idempotencyKey = `capture-${order.id}-${amount}`;
  let capturedAmount: number;

  if (order.paymentMethod === 'stripe') {
    if (!order.stripePaymentIntentId) {
      throw new Error('Mangler Stripe-referanse for reservasjonen');
    }
    capturedAmount = await captureStripeReservation({
      paymentIntentId: order.stripePaymentIntentId,
      amount,
      idempotencyKey,
    });
  } else if (order.paymentMethod === 'vipps') {
    capturedAmount = await captureVippsPayment({
      reference: vippsReferenceFor(order),
      amount,
      idempotencyKey,
    });
  } else {
    throw new Error('Ukjent betalingsmetode');
  }

  if (capturedAmount !== amount) {
    throw new Error(`Trekket ga ${capturedAmount} øre, forventa ${amount} øre`);
  }

  return capturedAmount;
}

// Refunds the full captured amount. Returns the refunded amount in øre.
export async function refundReservation(order: ReservationOrder): Promise<number> {
  const amount = order.reservedAmount ?? order.totalAmount;
  const idempotencyKey = `refund-${order.id}-${amount}`;

  if (order.paymentMethod === 'stripe') {
    if (!order.stripePaymentIntentId) {
      throw new Error('Mangler Stripe-referanse for reservasjonen');
    }
    return refundStripePayment({
      paymentIntentId: order.stripePaymentIntentId,
      amount,
      idempotencyKey,
    });
  }

  if (order.paymentMethod === 'vipps') {
    return refundVippsPayment({
      reference: vippsReferenceFor(order),
      amount,
      idempotencyKey,
    });
  }

  throw new Error('Ukjent betalingsmetode');
}
