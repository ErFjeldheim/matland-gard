import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
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

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                console.log(`Processing successful payment for order: ${orderId}`);

                // Update order status to paid
                const order = await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'paid' },
                    include: {
                        orderItems: {
                            include: {
                                product: true,
                            },
                        },
                    },
                });

                // Send confirmation emails
                try {
                    const orderEmailData = {
                        orderId: order.id,
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        customerPhone: order.customerPhone,
                        deliveryAddress: order.deliveryAddress,
                        totalAmount: order.totalAmount,
                        shippingMethod: order.shippingMethod,
                        orderItems: order.orderItems,
                    };

                    await Promise.all([
                        sendCustomerOrderConfirmation(orderEmailData),
                        sendAdminOrderNotification(orderEmailData),
                    ]);
                    console.log(`Confirmation emails sent for order: ${orderId}`);
                } catch (emailError) {
                    console.error(`Error sending emails for order ${orderId}:`, emailError);
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
