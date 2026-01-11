import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, cartItems, customerName, customerEmail, customerPhone, deliveryAddress, shippingMethod } = body;

    // Validate input
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Mangler påkrevd kundeinformasjon' },
        { status: 400 }
      );
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Mangler leveringsalternativ' },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    let orderItemsData: Array<{ productId: string; quantity: number; price: number }> = [];

    // Handle cart checkout vs single product checkout
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      // Cart checkout: create order items from cart
      for (const item of cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Produkt ikke funnet: ${item.productId}` },
            { status: 404 }
          );
        }

        totalAmount += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }
    } else if (productId && quantity) {
      // Single product checkout
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ error: 'Produkt ikke funnet' }, { status: 404 });
      }

      totalAmount = product.price * quantity;
      orderItemsData.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    } else {
      return NextResponse.json(
        { error: 'Mangler produkt eller handlekurv informasjon' },
        { status: 400 }
      );
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

    // Send order confirmation emails
    try {
      await Promise.all([
        sendCustomerOrderConfirmation(order),
        sendAdminOrderNotification(order),
      ]);
    } catch (emailError) {
      console.error('Error sending order confirmation emails:', emailError);
      // Don't fail the order if email fails
    }

    // TODO: Implement Vipps ePayment API integration
    // For now, return order details and phone number for manual Vipps payment
    
    return NextResponse.json({ 
      orderId: order.id,
      totalAmount,
      vippsNumber: '+4795458563', // Matland Gård Vipps number
      message: 'Send betaling via Vipps og oppgi ordrenummer i meldingen'
    });
  } catch (error) {
    console.error('Vipps checkout error:', error);
    return NextResponse.json(
      { error: 'Feil ved opprettelse av ordre' },
      { status: 500 }
    );
  }
}
