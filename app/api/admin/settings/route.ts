import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    // Check authentication via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Uautorisert' }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    // Check authentication via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
