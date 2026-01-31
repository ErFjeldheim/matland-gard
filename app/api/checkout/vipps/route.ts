import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { getNumberSetting } from '@/lib/settings';
import { initiateVippsPayment } from '@/app/lib/vipps';

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
        totalAmount += price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: price,
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
    if (shippingMethod === 'shipping_fixed_1000') {
      const fee = await getNumberSetting('shipping_fixed_1000', 1000);
      totalAmount += fee * 100 * shippingMultiplier;
    } else if (shippingMethod === 'shipping_fixed_1500') {
      const fee = await getNumberSetting('shipping_fixed_1500', 1500);
      totalAmount += fee * 100 * shippingMultiplier;
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
