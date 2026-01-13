import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import CardCarousel from './components/CardCarousel';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await prisma.setting.findMany();

  const getSetting = (key: string, fallback: string) => {
    return settings.find(s => s.key === key)?.value || fallback;
  };

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
          alt="Matland Gård oversikt"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">{heroTitle}</h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {heroText}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 flex-grow">
        {/* Three Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Singel & Stein */}
          <Link href="/singel">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer h-full flex flex-col group">
              <div className="relative">
                <CardCarousel
                  images={[
                    '/images/products/Herregårdssingel/bilde-1.jpg',
                    '/images/products/Herregårdssingel/bilde-2.jpg',
                    '/images/products/Herregårdssingel/bilde-3.jpg'
                  ]}
                  alt="Singel & Stein"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">Singel & Stein</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">Matland Singel & Stein</h3>
                <p className="text-gray-600 mb-4">
                  Forhandlar av Skjold Singel & Stein. Vi leverer herregårdssingel, pukk og
                  andre steinprodukt.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  Sjå produkt og prisar
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
                  alt="Bobilparkering"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">Bobilparkering</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">Matland Fjordcamp</h3>
                <p className="text-gray-600 mb-4">
                  Opplev naturen ved fjorden. Bestill plass til bobil eller hytte
                  for ei uforgløymeleg oppleving.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  Bestill no
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
                  alt="Selskapslokale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white">Selskapslokale</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">Selskap & Events</h3>
                <p className="text-gray-600 mb-4">
                  Unike lokale for bryllup, konfirmasjonar, firmafestar og andre spesielle anledningar.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center mt-auto">
                  Utforsk moglegheiter
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kontakt oss</h2>
          <p className="text-gray-600 mb-6">
            Har du spørsmål? Vi er her for å hjelpe deg.
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
