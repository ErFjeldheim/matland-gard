import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(ip, {
      limit: 5,
      window: '15 m',
      prefix: 'admin-login',
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'For mange forsøk. Prøv igjen seinare.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfter) },
        },
      );
    }

    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // Set secure cookie
      const cookieStore = await cookies();
      cookieStore.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Feil passord' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Serverfeil' },
      { status: 500 }
    );
  }
}
