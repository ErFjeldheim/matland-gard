import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ArrangementPage() {
  const t = useTranslations('Venue');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Image */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8 shadow-2xl">
          <Image
            src="/images/hero/selskapslokale.jpg"
            alt={t('title')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h2>
              <p className="text-2xl mb-2">{t('subtitle')}</p>
              <p className="text-[var(--color-accent)] text-lg">{t('tagline')}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md col-span-2">
                <Image
                  src="/images/arrangement/bordoppsetning.jpg"
                  alt="Bordoppsetning"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/hero/scene.jpg"
                  alt="Scene"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/hero/utsikt-vann.jpg"
                  alt="Utsikt"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">{t('sjobuaTitle')}</h3>
            <p className="text-gray-800 mb-4">
              {t('desc1')}
            </p>
            <p className="text-gray-800 mb-6">
              {t('desc2')}
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">🎉 {t('events.title')}</h4>
              <ul className="text-gray-900 space-y-2">
                {t.raw('events.items').map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('locales.title')}</h4>

              <div className="space-y-4">
                <div className="border-l-4 border-[var(--color-primary)] pl-4">
                  <h5 className="font-bold text-gray-900">{t('locales.sjobua')}</h5>
                  <p className="text-gray-800 text-sm">{t('locales.sjobuaDetail1')}</p>
                  <p className="text-gray-800 text-sm">{t('locales.sjobuaDetail2')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('services.title')}</h4>
              <ul className="space-y-3 text-gray-800">
                {t.raw('services.items').map((item: string) => (
                  <li key={item} className="flex items-start">
                    <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact info instead of form */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.title')}</h3>
          <p className="text-gray-800 mb-8 max-w-2xl mx-auto">
            {t('contact.desc')}
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12">
            <div className="text-center">
              <div className="bg-[var(--color-accent)]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('contact.email')}</h4>
              <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline font-medium">
                matlandgard@gmail.com
              </a>
            </div>

            <div className="text-center">
              <div className="bg-[var(--color-accent)]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('contact.phone')}</h4>
              <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline font-medium">
                +47 954 58 563
              </a>
            </div>

            <div className="text-center">
              <div className="bg-[var(--color-accent)]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('contact.address')}</h4>
              <p className="text-gray-800 font-medium">
                Ådlandsvegen 30, 5642 Holmefjord
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
