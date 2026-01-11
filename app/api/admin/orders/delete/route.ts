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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Mangler ordre-ID' },
        { status: 400 }
      );
    }

    // Delete order (will cascade delete order items due to onDelete: Cascade in schema)
    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke slette ordre' },
      { status: 500 }
    );
  }
}
