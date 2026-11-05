import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripeSessionPayment } from '@/lib/stripe-payments';
import { markReserved, sendReservationEmails } from '@/lib/reservations';

/* eslint-disable @typescript-eslint/no-explicit-any -- webhook types from the Stripe SDK
   use narrower event shapes than the generic any; tightening is a separate refactor. */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error('Webhook Error: Missing signature or endpoint secret');
            return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Idempotency: if we've already processed this event ID (Stripe retry,
    // concurrent duplicate delivery, or replay), acknowledge immediately.
    const already = await prisma.processedEvent.findUnique({
        where: { id: event.id },
    });
    if (already) {
        return NextResponse.json({ received: true });
    }

    // Dispatch by event type. The handler returns the order that was just
    // reserved (or captured) so we can email the customer, or null for no-op cases.
    let reservedOrder: Awaited<ReturnType<typeof markReserved>> = null;

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                console.log(`Processing authorized payment for order: ${orderId}`);

                const existingOrder = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (!existingOrder) {
                    console.error(`Order not found in webhook: ${orderId}`);
                    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
                }

                if (existingOrder.status === 'pending') {
                    const payment = await getStripeSessionPayment(session.id);

                    if (!payment) {
                        console.error(`Checkout session ${session.id} for order ${orderId} has no reservation yet`);
                    } else {
                        reservedOrder = await markReserved(orderId, {
                            reservedAmount: payment.amount,
                            captureDeadline: payment.status === 'reserved' ? payment.captureDeadline : null,
                            stripePaymentIntentId: payment.paymentIntentId,
                            captured: payment.status === 'captured',
                        });
                    }
                } else {
                    console.log(`Order ${orderId} already has status: ${existingOrder.status}. Skipping duplicate emails.`);
                }
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Mark as processed BEFORE sending emails. This means a failure during
    // the order update above causes no row to be written and Stripe will
    // retry cleanly; a failure during email send below just logs and
    // returns 200 so the order is not left "reserved but unremembered".
    try {
        await prisma.processedEvent.create({
            data: { id: event.id, type: event.type },
        });
    } catch (err: any) {
        // P2002 = unique constraint: a concurrent retry just inserted
        // the same row. Safe to ignore — the work was already done.
        if (err?.code !== 'P2002') {
            throw err;
        }
    }

    if (reservedOrder) {
        try {
            await sendReservationEmails(reservedOrder);
            console.log(`Request emails sent for order: ${reservedOrder.id}`);
        } catch (emailError) {
            console.error(`Error sending emails for order ${reservedOrder.id}:`, emailError);
        }
    }

    return NextResponse.json({ received: true });
}
