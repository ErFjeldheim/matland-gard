import { NextRequest, NextResponse } from 'next/server';
import { getVippsPayment } from '@/app/lib/vipps';
import { prisma } from '@/lib/prisma';
import { markReserved, sendReservationEmails, vippsReferenceFor } from '@/lib/reservations';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://new.matlandgard.no';

    if (!orderId) {
        return NextResponse.redirect(new URL('/nettbutikk', baseUrl));
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        return NextResponse.redirect(new URL('/handlekurv?payment_cancelled=true', baseUrl));
    }

    try {
        const paymentDetails = await getVippsPayment(vippsReferenceFor(order));

        // The order page verifies the payment again and reserves the order. A
        // CAPTURED state is also accepted in case the merchant account is set
        // to capture automatically.
        if (paymentDetails.state === 'AUTHORIZED' || paymentDetails.state === 'CAPTURED') {
            try {
                const reserved = await markReserved(orderId, {
                    reservedAmount: paymentDetails.amount.value,
                    captureDeadline:
                        paymentDetails.state === 'AUTHORIZED' && paymentDetails.captureGuaranteedUntil
                            ? new Date(paymentDetails.captureGuaranteedUntil)
                            : null,
                    vippsReference: vippsReferenceFor(order),
                    captured: paymentDetails.state === 'CAPTURED',
                });
                if (reserved) {
                    await sendReservationEmails(reserved);
                }
            } catch (reservationError) {
                // The success page retries the same verification, so a transient
                // failure here must not send the customer to an error page.
                console.error(`Could not reserve order ${orderId} in Vipps callback:`, reservationError);
            }

            return NextResponse.redirect(new URL(`/bestilling/${orderId}?vipps=success`, baseUrl));
        }

        // Only an unpaid order can be removed after a failed payment. Never
        // delete an order that has already been reserved or captured.
        if (order.status === 'pending') {
            try {
                await prisma.order.delete({ where: { id: orderId } });
            } catch (dbError) {
                console.warn(`Could not delete order ${orderId} after failed payment:`, dbError);
            }
        }

        return NextResponse.redirect(new URL('/handlekurv?payment_cancelled=true', baseUrl));
    } catch (error) {
        console.error('Error in Vipps callback:', error);
        return NextResponse.redirect(new URL('/handlekurv?error=payment_verification_failed', baseUrl));
    }
}
