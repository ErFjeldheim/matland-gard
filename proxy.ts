import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPABASE_AUTH_COOKIE_PREFIX = '-auth-token';

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;

  const projectRef = url.split('//')[1]?.split('.')[0];
  if (!projectRef) return false;

  const cookiePrefix = `sb-${projectRef}${SUPABASE_AUTH_COOKIE_PREFIX}`;

  for (const { name } of request.cookies.getAll()) {
    if (name === cookiePrefix || name.startsWith(`${cookiePrefix}-`)) {
      return true;
    }
  }

  return false;
}

export function proxy(request: NextRequest) {
    if (hasSupabaseAuthCookie(request)) {
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
        // All /api/admin routes.
        '/api/admin/(.*)',
    ],
};
