'use server';

/* eslint-disable @typescript-eslint/no-explicit-any -- legacy order/Stripe types; tightening
   this file to strict types is a separate refactor. */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getNumberSetting } from '@/lib/settings';
import { getCheckoutUnitPrice } from '@/lib/product-prices';
import {
    calculateFixedShippingFee,
    isFixedShippingEligible,
    isShippingUnit,
} from '@/lib/shipping';
import { createClient } from '@/utils/supabase/server';
import {
    sendCustomerCaptureReceipt,
    sendCustomerRequestApproved,
    sendCustomerRequestDeclined,
    sendRefundNotification,
} from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import {
    canDeleteOrder,
    getReservationActions,
    isAllowedManualStatus,
    isCaptureDeadlinePassed,
} from '@/lib/order-flow';
import { captureReservation, refundReservation, releaseReservation } from '@/lib/reservations';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as any,
});

// Admin Actions
export async function updateOrderStatus(orderId: string, status: string) {
    // Check authentication via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Ikke autorisert');
    }

    if (!orderId || !status) {
        throw new Error('Mangler påkrevd informasjon');
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'processing', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
        throw new Error('Ugyldig status');
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
        throw new Error('Ordre ikkje funne');
    }
    if (!isAllowedManualStatus(existing, status)) {
        throw new Error('Denne ordren må handsamast med knappane for forespurnaden (godkjenn, avslå eller trekk beløp).');
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Send refund notification if status is changed to refunded
        if (status === 'refunded') {
            try {
                await sendRefundNotification(order as any);
            } catch (emailError) {
                console.error('Failed to send refund notification:', emailError);
            }
        }

        revalidatePath('/admin');
        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, order };
    } catch (error) {
        console.error('Update order status error:', error);
        throw new Error('Kunne ikke oppdatere ordre');
    }
}

export async function deleteOrder(orderId: string) {
    // Check authentication via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Ikke autorisert');
    }

    if (!orderId) {
        throw new Error('Mangler ordre-ID');
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (existing && !canDeleteOrder(existing)) {
        throw new Error('Ordren har ein aktiv reservasjon eller er allereie trekt. Avslå forespurnaden først, eller behald ordren for bokføring.');
    }

    try {
        await prisma.order.delete({
            where: { id: orderId },
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Delete order error:', error);
        throw new Error('Kunne ikke slette ordre');
    }
}

async function assertAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Ikke autorisert');
    }
}

async function loadOrderForAction(orderId: string) {
    if (!orderId) {
        throw new Error('Mangler ordre-ID');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error('Ordre ikkje funne');
    }

    return order;
}

async function loadOrderWithItems(orderId: string) {
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

export async function approveOrder(orderId: string) {
    await assertAdminUser();
    const order = await loadOrderForAction(orderId);

    if (!getReservationActions(order).approve) {
        throw new Error('Forespurnaden kan ikkje godkjennast no');
    }

    const result = await prisma.order.updateMany({
        where: { id: orderId, status: 'requested' },
        data: { status: 'approved' },
    });
    if (result.count === 0) {
        throw new Error('Forespurnaden er allereie handsama');
    }

    const approved = await loadOrderWithItems(orderId);
    if (approved) {
        await sendCustomerRequestApproved(approved);
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
}

export async function declineOrder(orderId: string) {
    await assertAdminUser();
    const order = await loadOrderForAction(orderId);

    if (!getReservationActions(order).decline) {
        throw new Error('Forespurnaden kan ikkje avslåast no');
    }

    try {
        await releaseReservation(order);
    } catch (error) {
        console.error(`Failed to release reservation for order ${orderId}:`, error);
        throw new Error('Kunne ikkje frigi reservasjonen. Prøv igjen, eller sjekk betalingsleverandøren.');
    }

    const result = await prisma.order.updateMany({
        where: { id: orderId, status: { in: ['requested', 'approved'] } },
        data: { status: 'declined' },
    });
    if (result.count === 0) {
        console.error(`Reservation released but status not updated for order ${orderId}`);
        throw new Error('Reservasjonen er frigitt, men statusen blei ikkje oppdatert. Kontakt utviklar.');
    }

    const declined = await loadOrderWithItems(orderId);
    if (declined) {
        await sendCustomerRequestDeclined(declined);
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
}

export async function captureOrder(orderId: string) {
    await assertAdminUser();
    const order = await loadOrderForAction(orderId);

    if (!getReservationActions(order).capture) {
        if (order.status === 'approved' && isCaptureDeadlinePassed(order, new Date())) {
            throw new Error('Trekkfristen er passert. Be kunden betale på nytt.');
        }
        throw new Error('Beløpet kan ikkje trekkast no');
    }

    let capturedAmount: number;
    try {
        capturedAmount = await captureReservation(order);
    } catch (error) {
        console.error(`Failed to capture order ${orderId}:`, error);
        throw new Error('Kunne ikkje trekke beløpet. Sjekk betalingsleverandøren før du prøver igjen.');
    }

    const result = await prisma.order.updateMany({
        where: { id: orderId, status: 'approved' },
        data: { status: 'paid', capturedAmount, capturedAt: new Date() },
    });
    if (result.count === 0) {
        console.error(`Captured ${capturedAmount} øre but status not updated for order ${orderId}`);
        throw new Error('Beløpet er trekt, men statusen blei ikkje oppdatert. Kontakt utviklar.');
    }

    const paid = await loadOrderWithItems(orderId);
    if (paid) {
        await sendCustomerCaptureReceipt(paid);
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, capturedAmount };
}

export async function refundOrder(orderId: string) {
    await assertAdminUser();
    const order = await loadOrderForAction(orderId);

    if (!getReservationActions(order).refund) {
        throw new Error('Beløpet kan ikkje refunderast no');
    }

    let refundedAmount: number;
    try {
        refundedAmount = await refundReservation(order);
    } catch (error) {
        console.error(`Failed to refund order ${orderId}:`, error);
        throw new Error('Kunne ikkje refundere beløpet. Sjekk betalingsleverandøren før du prøver igjen.');
    }

    if (refundedAmount !== (order.reservedAmount ?? order.totalAmount)) {
        console.error(`Refunded ${refundedAmount} øre for order ${orderId}, expected ${order.reservedAmount}`);
        throw new Error('Refusjonen gav eit anna beløp enn forventa. Kontakt utviklar før du gjer meir.');
    }

    const result = await prisma.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: 'refunded' },
    });
    if (result.count === 0) {
        console.error(`Refunded ${refundedAmount} øre but status not updated for order ${orderId}`);
        throw new Error('Beløpet er refundert, men statusen blei ikkje oppdatert. Kontakt utviklar.');
    }

    const refunded = await loadOrderWithItems(orderId);
    if (refunded) {
        await sendRefundNotification(refunded as any);
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, refundedAmount };
}

// Checkout Actions
interface CartItem {
    productId: string;
    quantity: number;
    size?: string;
    price?: number; // Optional as we verify on server
}

interface CheckoutData {
    productId?: string;
    quantity?: number;
    cartItems?: CartItem[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress?: string;
    shippingMethod: string;
    size?: string;
}

export async function createStripeCheckoutSession(data: CheckoutData) {
    const { productId, quantity, cartItems, customerName, customerEmail, customerPhone, deliveryAddress, shippingMethod } = data;

    // Rate limit by client IP (server actions don't get a Request object,
    // so we pull x-forwarded-for from next/headers).
    const headerStore = await headers();
    const ip = getClientIp({
        headers: { get: (name) => headerStore.get(name) },
    });
    const limit = await checkRateLimit(ip, {
        limit: 10,
        window: '1 h',
        prefix: 'stripe-checkout',
    });
    if (!limit.allowed) {
        throw new Error('For mange bestillingar. Prøv igjen seinare.');
    }

    // Validate input
    if (!customerName || !customerEmail || !customerPhone) {
        throw new Error('Manglar påkravd kundeinformasjon');
    }

    if (!shippingMethod) {
        throw new Error('Manglar leveringsalternativ');
    }

    if (shippingMethod === 'shipping_quote') {
        throw new Error('Dette leveringsalternativet er ikkje tilgjengeleg i nettbutikken. Ta kontakt for levering.');
    }

    let totalAmount = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; price: number; size: string | null }> = [];
    const stripeLineItems: Array<any> = [];

    const getPriceWithMetadata = async (product: any, size?: string) => {
        return getCheckoutUnitPrice(product, size);
    };

    // Handle cart checkout vs single product checkout
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        for (const item of cartItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new Error(`Produkt ikkje funne: ${item.productId}`);
            }

            const price = await getPriceWithMetadata(product, item.size);
            const name = item.size ? `${product.name} (${item.size})` : product.name;

            totalAmount += price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: price,
                size: item.size ?? null,
            });
            stripeLineItems.push({
                price_data: {
                    currency: 'nok',
                    product_data: {
                        name: name,
                        description: product.description || undefined,
                    },
                    unit_amount: price,
                },
                quantity: item.quantity,
            });
        }
    } else if (productId && quantity) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error('Produkt ikkje funne');
        }

        const price = await getPriceWithMetadata(product, data.size);
        const name = data.size ? `${product.name} (${data.size})` : product.name;

        totalAmount = price * quantity;
        orderItemsData.push({
            productId: product.id,
            quantity,
            price: price,
            size: data.size ?? null,
        });
        stripeLineItems.push({
            price_data: {
                currency: 'nok',
                product_data: {
                    name: name,
                    description: product.description || undefined,
                },
                unit_amount: price,
            },
            quantity,
        });
    } else {
        throw new Error('Manglar produkt eller handlekorg informasjon');
    }

    // Calculate total units (storsekker or tons of grus) for shipping
    let totalUnits = 0;
    for (const item of orderItemsData) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && isShippingUnit(product.name)) {
            totalUnits += item.quantity;
        }
    }

    // Add shipping fee
    let shippingFee = 0;
    if (shippingMethod === 'shipping_fixed') {
        if (!isFixedShippingEligible(totalUnits)) {
            throw new Error('Fastpris frakt gjeld ved bestilling av minst 2 big bags. Vel henting, eller ta kontakt for levering.');
        }
        const base = await getNumberSetting('shipping_fixed', 1500);
        const extraPerUnit = await getNumberSetting('shipping_extra_per_unit', 750);
        shippingFee = calculateFixedShippingFee(totalUnits, base, extraPerUnit) * 100;
    } else if (shippingMethod === 'pickup_dokken') {
        shippingFee = 125 * 100 * totalUnits;
    }

    if (shippingFee > 0) {
        totalAmount += shippingFee;
        stripeLineItems.push({
            price_data: {
                currency: 'nok',
                product_data: {
                    name: 'Frakt',
                    description: (shippingMethod === 'shipping_fixed' ? 'Fastpris (heile landet)' : 'Henting Skur 25 Møhlenpriskaien 8') + (shippingMethod === 'shipping_fixed' ? ` (${totalUnits} big bags)` : totalUnits > 1 ? ` (x${totalUnits})` : ''),
                },
                unit_amount: shippingFee,
            },
            quantity: 1,
        });
    }

    try {
        // Create order in database
        const order = await prisma.order.create({
            data: {
                customerName,
                customerEmail,
                customerPhone,
                deliveryAddress: deliveryAddress || null,
                totalAmount,
                status: 'pending',
                paymentMethod: 'stripe',
                shippingMethod,
                orderItems: {
                    create: orderItemsData,
                },
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: stripeLineItems,
            mode: 'payment',
            payment_intent_data: {
                capture_method: 'manual',
            },
            custom_text: {
                submit: {
                    message: 'Beløpet blir reservert, men ikkje trekt før varen er sendt.',
                },
            },
            success_url: `${process.env.NEXT_PUBLIC_URL}/bestilling/${order.id}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/api/stripe-cancel/${order.id}`,
            metadata: {
                orderId: order.id,
            },
            customer_email: customerEmail,
        });

        // Update order with payment ID
        await prisma.order.update({
            where: { id: order.id },
            data: { paymentId: session.id },
        });

        return { sessionId: session.id, url: session.url };
    } catch (error) {
        console.error('Stripe checkout error:', error);
        throw new Error('Feil ved opprettelse av betaling');
    }
}

export async function retryVippsPayment(orderId: string) {
    if (!orderId) {
        throw new Error('Mangler ordre-ID');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        throw new Error('Ordre ikkje funne');
    }

    if (order.status === 'paid') {
        throw new Error('Ordren er allerede betalt');
    }

    if (order.status !== 'pending') {
        throw new Error('Ordren kan ikkje betalast på nytt');
    }

    // Dynamic import to avoid circular dependency issues if any
    const { initiateVippsPayment } = await import('@/app/lib/vipps');

    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const reference = `${order.id}_retry_${Date.now()}`;

        const vippsResponse = await initiateVippsPayment({
            orderId: order.id,
            reference: reference, // Unique reference for retry
            amount: order.totalAmount, // Already in øre from DB
            mobileNumber: order.customerPhone,
            returnUrl: `${baseUrl}/bestilling/${order.id}?vipps=success`,
            description: `Ordre #${order.id} (Retry) fra Matland Gård`,
        });

        if (vippsResponse.redirectUrl) {
            await prisma.order.update({
                where: { id: order.id },
                data: { vippsReference: reference },
            });
            redirect(vippsResponse.redirectUrl);
        } else {
            throw new Error('Ingen redirect URL fra Vipps');
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Error retrying Vipps payment:', error);
        throw new Error('Kunne ikke starte Vipps-betaling på nytt');
    }
}
