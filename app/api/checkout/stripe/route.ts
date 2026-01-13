import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { getNumberSetting } from '@/lib/settings';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, cartItems, customerName, customerEmail, customerPhone, deliveryAddress, shippingMethod } = body;

    // Validate input
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Manglar påkravd kundeinformasjon' },
        { status: 400 }
      );
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Manglar leveringsalternativ' },
        { status: 400 }
      );
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
          return NextResponse.json(
            { error: `Produkt ikkje funne: ${item.productId}` },
            { status: 404 }
          );
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
        return NextResponse.json({ error: 'Produkt ikkje funne' }, { status: 404 });
      }

      const price = await getPriceWithMetadata(product, body.size);
      const name = body.size ? `${product.name} (${body.size})` : product.name;

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
      return NextResponse.json(
        { error: 'Manglar produkt eller handlekorg informasjon' },
        { status: 400 }
      );
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

    // Create order in database
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
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
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/singel?cancelled=true`,
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

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Feil ved opprettelse av betaling' },
      { status: 500 }
    );
  }
}
