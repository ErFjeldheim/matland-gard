'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getNumberSetting } from '@/lib/settings';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // FORCE_UPDATE_DEBUG_1 
    apiVersion: '2026-01-28.clover' as any,
});

// Admin Actions
export async function updateOrderStatus(orderId: string, status: string) {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        throw new Error('Ikke autorisert');
    }

    if (!orderId || !status) {
        throw new Error('Mangler påkrevd informasjon');
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new Error('Ugyldig status');
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        revalidatePath('/admin');
        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, order };
    } catch (error) {
        console.error('Update order status error:', error);
        throw new Error('Kunne ikke oppdatere ordre');
    }
}

export async function deleteOrder(orderId: string) {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        throw new Error('Ikke autorisert');
    }

    if (!orderId) {
        throw new Error('Mangler ordre-ID');
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

    // Validate input
    if (!customerName || !customerEmail || !customerPhone) {
        throw new Error('Manglar påkravd kundeinformasjon');
    }

    if (!shippingMethod) {
        throw new Error('Manglar leveringsalternativ');
    }

    let totalAmount = 0;
    let orderItemsData: Array<{ productId: string; quantity: number; price: number }> = [];
    let stripeLineItems: Array<any> = [];

    const getPriceWithMetadata = async (product: any, size?: string) => {
        if (product.name === 'Herregårdssingel') {
            if (size === '4-8mm') return (await getNumberSetting('herregardssingel_price_4-8mm', 1750)) * 100;
            if (size === '8-16mm') return (await getNumberSetting('herregardssingel_price_8-16mm', 1500)) * 100;
            if (size === '16-32mm') return (await getNumberSetting('herregardssingel_price_16-32mm', 1500)) * 100;
        }
        if (product.name === 'Grus') {
            if (size === '0-16mm') return (await getNumberSetting('grus_price_0-16mm', 599)) * 100;
            if (size === '0-32mm') return (await getNumberSetting('grus_price_0-32mm', 599)) * 100;
        }
        return product.price;
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

    // Calculate total units (storsekker or tons of grus) for shipping multiplier
    let totalUnits = 0;
    for (const item of orderItemsData) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && !product.name.toLowerCase().includes('matte')) {
            totalUnits += item.quantity;
        }
    }
    const shippingMultiplier = totalUnits;

    // Add shipping fee
    let shippingFee = 0;
    if (shippingMethod === 'shipping_fixed_1000') {
        shippingFee = (await getNumberSetting('shipping_fixed_1000', 1000)) * 100;
    } else if (shippingMethod === 'shipping_fixed_1500') {
        shippingFee = (await getNumberSetting('shipping_fixed_1500', 1500)) * 100;
    }

    if (shippingFee > 0) {
        const finalShippingFee = shippingFee * shippingMultiplier;
        totalAmount += finalShippingFee;
        stripeLineItems.push({
            price_data: {
                currency: 'nok',
                product_data: {
                    name: 'Frakt',
                    description: (shippingMethod === 'shipping_fixed_1000' ? 'Sone 1' : 'Sone 2') + (shippingMultiplier > 1 ? ` (x${shippingMultiplier})` : ''),
                },
                unit_amount: finalShippingFee,
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
            success_url: `${process.env.NEXT_PUBLIC_URL}/bestilling/${order.id}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/nettbutikk?cancelled=true`,
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
