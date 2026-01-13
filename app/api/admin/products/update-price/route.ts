
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, price } = body;

        if (!productId || price === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (typeof price !== 'number' || price < 0) {
            return NextResponse.json(
                { error: 'Price must be a non-negative number' },
                { status: 400 }
            );
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: { price },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to update price' },
            { status: 500 }
        );
    }
}
