'use client';

import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Import map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => {
    const commonT = useTranslations('Common');
    return <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">{commonT('loadingMap')}</div>;
  }
});

export default function KontaktPage() {
  const t = useTranslations('Contact');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t('title')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Kontaktinformasjon */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('info')}</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('phone')}</h3>
                    <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">
                      +47 954 58 563
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('email')}</h3>
                    <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">
                      matlandgard@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('address')}</h3>
                    <p className="text-gray-600">
                      Matland Gård<br />
                      Ådlandsvegen 30<br />
                      5642 Holmefjord
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Åpningstider / Informasjon */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('visitUs')}</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('Navigation.shop', { defaultValue: 'Singel & Stein' })}</h3>
                  <p className="text-gray-600 mb-3">
                    {t.rich('shopDesc', {
                      Link: (chunks) => <Link href="/nettbutikk" className="text-[var(--color-primary)] hover:underline font-semibold">{chunks}</Link>
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('Navigation.parking', { defaultValue: 'Bobilparkering' })}</h3>
                  <p className="text-gray-600">
                    {t.rich('campingDesc', {
                      Link: (chunks) => <a href="https://campio.no" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline font-semibold">{chunks}</a>,
                      br: () => <br />
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('Navigation.venue', { defaultValue: 'Selskapslokale' })}</h3>
                  <p className="text-gray-600">
                    {t('venueDesc')}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {t('replyNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kart */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('findWay')}</h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <MapComponent />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Ådlandsvegen 30, 5642 Holmefjord
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
