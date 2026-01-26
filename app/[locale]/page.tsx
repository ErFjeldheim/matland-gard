import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import CardCarousel from '../components/CardCarousel';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const settings = await prisma.setting.findMany();

  const getSetting = (key: string, fallback: string) => {
    return settings.find(s => s.key === key)?.value || fallback;
  };

  // Note: Hero content is dynamic from DB, but fallbacks could be translated if we strictly wanted to.
  // For now, keeping DB content as source of truth for Hero.
  const heroTitle = getSetting('hero_title', 'Velkomen til Matland Gård');
  const heroText = getSetting('hero_text', 'Vi tilbyr steinprodukt av høgaste kvalitet, bobilparkering ved fjorden, og unike lokale til dine selskap.');
  const heroImage = getSetting('hero_image_url', '/images/hero/gard-oversikt.jpg');
  const contactPhone = getSetting('contact_phone', '+47 954 58 563');
  const contactEmail = getSetting('contact_email', 'matlandgard@gmail.com');
  const contactAddress = getSetting('contact_address', 'Ådlandsvegen 30, 5642 Holmefjord');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white text-center">
        <Image
          src={heroImage}
          alt={t('heroAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">{heroTitle}</h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {heroText}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 flex-grow">
        {/* Three Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Singel & Stein */}
          <Link href="/nettbutikk">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer h-full flex flex-col group">
              <div className="relative">
                <CardCarousel
                  images={[
                    '/images/products/Herregårdssingel/bilde-1.jpg',
                    '/images/products/Herregårdssingel/bilde-2.jpg',
                    '/images/products/Herregårdssingel/bilde-3.jpg'
                  ]}
                  alt={t('shopCard.overlay')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">{t('shopCard.overlay')}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">{t('shopCard.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('shopCard.desc')}
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  {t('shopCard.link')}
                  <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Bobilparkering */}
          <Link href="/camping">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer h-full flex flex-col group">
              <div className="relative">
                <CardCarousel
                  images={[
                    '/images/camping/campingbil.jpg',
                    '/images/hero/kayak.jpg',
                    '/images/camping/kai.jpg'
                  ]}
                  alt={t('campingCard.overlay')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">{t('campingCard.overlay')}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">{t('campingCard.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('campingCard.desc')}
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  {t('campingCard.link')}
                  <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Selskapslokale */}
          <Link href="/arrangement">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer h-full flex flex-col group">
              <div className="relative">
                <CardCarousel
                  images={[
                    '/images/arrangement/bryllup.jpg',
                    '/images/arrangement/bordoppsetning.jpg'
                  ]}
                  alt={t('venueCard.overlay')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">{t('venueCard.overlay')}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">{t('venueCard.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('venueCard.desc')}
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  {t('venueCard.link')}
                  <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('contact.desc')}
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-accent)]">
              📞 {contactPhone}
            </a>
            <a href={`mailto:${contactEmail}`} className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-accent)]">
              ✉️ {contactEmail}
            </a>
            <p className="text-gray-600">
              📍 {contactAddress}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
