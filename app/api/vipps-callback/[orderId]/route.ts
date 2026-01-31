
import { NextRequest, NextResponse } from 'next/server';
import { getVippsPayment } from '@/app/lib/vipps';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    if (!orderId) {
        return NextResponse.redirect(new URL('/nettbutikk', request.url));
    }

    try {
        const paymentDetails = await getVippsPayment(orderId);

        // If Authorized or Captured -> Success
        if (paymentDetails.state === 'AUTHORIZED' || paymentDetails.state === 'CAPTURED') {
            // Redirect to order page with success param
            // The order page will verify status again (redundant but safe) and handle success logic (emails)
            return NextResponse.redirect(new URL(`/bestilling/${orderId}?vipps=success`, request.url));
        }


        // If Aborted, Cancelled, Failed, etc. -> Failure

        // Delete the pending order so it doesn't show up in Admin
        try {
            await prisma.order.delete({
                where: { id: orderId }
            });
        } catch (dbError) {
            console.warn(`Could not delete order ${orderId} after failed payment:`, dbError);
        }

        // Redirect to store with error
        return NextResponse.redirect(new URL('/handlekurv?payment_cancelled=true', request.url));

    } catch (error) {
        console.error('Error in Vipps callback:', error);
        // On error, redirect to store with generic error
        return NextResponse.redirect(new URL('/handlekurv?error=payment_verification_failed', request.url));
    }
}
