'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const languages = [
    { code: 'nb', name: 'Norsk' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
];

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

    const handleLanguageChange = (newLocale: string) => {
        let path = pathname;
        console.log('Language Change Request:', { currentLocale: locale, newLocale, currentPath: pathname });

        // Explicitly set the cookie to the new locale to avoid middleware redirect loops
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        const defaultLocale = 'nb';

        // 1. Strip current locale from path
        if (locale !== defaultLocale) {
            // If current path starts with /locale, remove it
            if (path.startsWith(`/${locale}`)) {
                path = path.replace(`/${locale}`, '');
                // Ensure path starts with /
                if (!path.startsWith('/')) {
                    path = '/' + path;
                }
            }
        }

        // 2. Add new locale (unless it's default)
        if (newLocale !== defaultLocale) {
            if (path === '/') {
                path = `/${newLocale}`;
            } else {
                path = `/${newLocale}${path}`;
            }
        } else {
            // If switching to default locale, path is already clean or needs strict /
            if (path === '') {
                path = '/';
            }
        }

        console.log('Redirecting to:', path);
        // Use window.location for a hard refresh to ensure cookie is respected
        window.location.href = path;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[var(--color-primary)] transition-colors duration-200 focus:outline-none cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="font-medium">{currentLanguage.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--color-dark)] border border-gray-700 rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 cursor-pointer ${locale === lang.code
                                    ? 'bg-[var(--color-primary)] text-[var(--color-accent)] font-bold'
                                    : 'text-white hover:bg-[var(--color-primary)] hover:text-white'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
