import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { getNumberSetting } from '@/lib/settings';
import { initiateVippsPayment } from '@/app/lib/vipps';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

/* eslint-disable @typescript-eslint/no-explicit-any -- Vipps checkout uses loosely-typed
   product lookups during price calculation; tightening is a separate refactor. */

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(ip, {
      limit: 10,
      window: '1 h',
      prefix: 'vipps-checkout',
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'For mange bestillingar. Prøv igjen seinare.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfter) },
        },
      );
    }

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
    const orderItemsData: Array<{ productId: string; quantity: number; price: number; size: string | null }> = [];

    const getPriceWithMetadata = async (product: any, size?: string) => {
      if (product.name === 'Herregårdssingel') {
        if (size === '2-4mm') return (await getNumberSetting('herregardssingel_price_2-4mm', 1899)) * 100;
        if (size === '4-8mm') return (await getNumberSetting('herregardssingel_price_4-8mm', 1699)) * 100;
        if (size === '8-16mm') return (await getNumberSetting('herregardssingel_price_8-16mm', 1499)) * 100;
        if (size === '16-32mm') return (await getNumberSetting('herregardssingel_price_16-32mm', 1399)) * 100;
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
        totalAmount += price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: price,
          size: item.size ?? null,
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
      totalAmount = price * quantity;
      orderItemsData.push({
        productId: product.id,
        quantity,
        price: price,
        size: body.size ?? null,
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
    if (shippingMethod === 'shipping_fixed_1250') {
      const fee = await getNumberSetting('shipping_fixed_1250', 1250);
      totalAmount += fee * 100 * shippingMultiplier;
    } else if (shippingMethod === 'shipping_fixed_1875') {
      const fee = await getNumberSetting('shipping_fixed_1875', 1875);
      totalAmount += fee * 100 * shippingMultiplier;
    } else if (shippingMethod === 'pickup_dokken') {
      totalAmount += 125 * 100 * shippingMultiplier;
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
        paymentMethod: 'vipps',
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



    // Initiate Vipps Payment
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
      const vippsResponse = await initiateVippsPayment({
        orderId: order.id,
        amount: totalAmount,
        mobileNumber: customerPhone,
        returnUrl: `${baseUrl}/api/vipps-callback/${order.id}`,
        description: `Ordre #${order.id} fra Matland Gård`,
      });

      return NextResponse.json({
        orderId: order.id,
        redirectUrl: vippsResponse.redirectUrl,
      });
    } catch (vippsError) {
      console.error('Error initiating Vipps payment:', vippsError);
      // Fallback or error handling
      return NextResponse.json(
        { error: 'Kunne ikke starte Vipps-betaling. Vennligst prøv igjen eller velg en annen betalingsmetode.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Vipps checkout error:', error);
    return NextResponse.json(
      { error: 'Feil ved opprettelse av ordre' },
      { status: 500 }
    );
  }
}
