import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, customerName, customerEmail, customerPhone, deliveryAddress } = body;

    // Validate input
    if (!productId || !quantity || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Mangler påkrevd informasjon' },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produkt ikke funnet' }, { status: 404 });
    }

    const totalAmount = product.price * quantity;

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
        orderItems: {
          create: [{
            productId,
            quantity,
            price: product.price,
          }],
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
