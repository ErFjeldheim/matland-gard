import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

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
    let stripeLineItems: Array<any> = [];

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
        stripeLineItems.push({
          price_data: {
            currency: 'nok',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
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
      stripeLineItems.push({
        price_data: {
          currency: 'nok',
          product_data: {
            name: product.name,
            description: product.description || undefined,
          },
          unit_amount: product.price,
        },
        quantity,
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

    // Send order confirmation emails
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
    } catch (emailError) {
      console.error('Error sending order confirmation emails:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Feil ved opprettelse av betaling' },
      { status: 500 }
    );
  }
}
