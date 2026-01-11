import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Velkommen til Matland Gard</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vi tilbyr steinprodukter av høyeste kvalitet, campingopplevelser ved fjorden, 
            og unike lokaler for dine arrangementer.
          </p>
        </div>

        {/* Three Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Singel & Stein */}
          <Link href="/singel">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
              <div className="relative h-64 bg-[var(--color-dark)]">
                <Image
                  src="/images/products/Herregårdssingel/bilde-1.jpg"
                  alt="Herregårdssingel"
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6">
                  <h3 className="text-2xl font-bold text-white">Singel & Stein</h3>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Matland Singel & Stein</h3>
                <p className="text-gray-600 mb-4">
                  Forhandler av Skjold Singel & Stein. Vi leverer herregårdssingel, pukk, 
                  andre steinprodukter.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center">
                  Se produkter og priser
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Camping */}
          <Link href="/camping">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
              <div className="relative h-64 bg-[var(--color-dark)]">
                <Image
                  src="/images/camping/campingbil.jpg"
                  alt="Matland Fjordcamp"
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6">
                  <h3 className="text-2xl font-bold text-white">Camping</h3>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Matland Fjordcamp</h3>
                <p className="text-gray-600 mb-4">
                  Opplev naturen ved fjorden. Book din campingplass eller hytte 
                  for en uforglemmelig opplevelse.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center">
                  Book nå
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Arrangement */}
          <Link href="/arrangement">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
              <div className="relative h-64 bg-[var(--color-dark)]">
                <Image
                  src="/images/arrangement/bryllup.jpg"
                  alt="Arrangement og bryllup"
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 to-transparent flex items-end justify-center pb-6">
                  <h3 className="text-2xl font-bold text-white">Arrangement</h3>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Arrangement & Events</h3>
                <p className="text-gray-600 mb-4">
                  Unike lokaler for bryllup, konfirmasjoner, firmafester og andre spesielle anledninger.
                </p>
                <div className="text-[var(--color-primary)] font-semibold flex items-center">
                  Utforsk muligheter
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <a href="tel:+4795458563" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-accent)]">
              📞 +47 954 58 563
            </a>
            <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-accent)]">
              ✉️ matlandgard@gmail.com
            </a>
            <p className="text-gray-600">
              📍 Ådlandsvegen 30, 5642 Holmefjord
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
