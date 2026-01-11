import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Ikke autorisert' },
        { status: 401 }
      );
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Mangler påkrevd informasjon' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ugyldig status' },
        { status: 400 }
      );
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere ordre' },
      { status: 500 }
    );
  }
}
