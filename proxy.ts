import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

const proxy = createMiddleware({
    locales: locales,
    defaultLocale: 'nb',
    localePrefix: 'as-needed'
});

export default function (req: any) {
    console.log('[proxy] Processing request:', req.nextUrl.pathname);
    return proxy(req);
}

export const config = {
    matcher: ['/', '/(nb|en|de|fr|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
