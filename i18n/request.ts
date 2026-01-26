import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['nb', 'en', 'de', 'fr', 'es'];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    console.log(`[i18n/request] Loading config for locale: ${locale}`);

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as any)) {
        console.log(`[i18n/request] Invalid or undefined locale: ${locale}, falling back to default`);
        locale = 'nb'; // Fallback to default locale
    }

    try {
        const messages = (await import(`../messages/${locale}.json`)).default;
        console.log(`[i18n/request] Messages loaded for ${locale}`);
        return {
            locale,
            messages
        };
    } catch (error) {
        console.error(`[i18n/request] Failed to load messages for ${locale}`, error);
        throw error;
    }
});
