import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin-auth';
const ADMIN_COOKIE_VALUE = 'authenticated';

export function proxy(request: NextRequest) {
    const cookie = request.cookies.get(ADMIN_COOKIE);

    if (cookie?.value === ADMIN_COOKIE_VALUE) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/api/admin/')) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        // All /admin pages except /admin/login itself.
        '/admin/((?!login$).*)',
        // All /api/admin routes except login/logout/check-auth which
        // must work without an active session.
        '/api/admin/((?!login|logout|check-auth$).*)',
    ],
};
