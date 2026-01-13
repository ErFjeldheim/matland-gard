import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        return NextResponse.json({ error: 'Uautorisert' }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        return NextResponse.json({ error: 'Uautorisert' }, { status: 401 });
    }

    try {
        const { key, value } = await request.json();

        if (!key) {
            return NextResponse.json({ error: 'Nøkkel manglar' }, { status: 400 });
        }

        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Feil ved oppdatering av innstilling' }, { status: 500 });
    }
}
