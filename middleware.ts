import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

const middleware = createMiddleware({
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: 'nb',

    // Don't use a prefix for the default locale
    localePrefix: 'as-needed'
});

export default function (req: any) {
    console.log('[middleware] Processing request:', req.nextUrl.pathname);
    return middleware(req);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(nb|en|de|fr|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
