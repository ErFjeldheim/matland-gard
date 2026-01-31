
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await context.params;

    if (!orderId) {
        return NextResponse.redirect(new URL('/handlekurv', request.url));
    }

    try {
        // Find order to verify it exists and is pending
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (order && order.status === 'pending') {
            await prisma.order.delete({
                where: { id: orderId }
            });
        }

    } catch (error) {
        console.error(`Error handling Stripe cancel for order ${orderId}:`, error);
    }

    // Always redirect to cart with cancelled status
    return NextResponse.redirect(new URL('/handlekurv?payment_cancelled=true', request.url));
}
