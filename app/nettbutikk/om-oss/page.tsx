import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-[var(--color-primary)]">Heim</Link>
          {' > '}
          <span className="text-gray-900">Om oss</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-96 md:h-auto">
              <Image
                src="/images/tore-johannes.jpg"
                alt="Tore Johannes - Matland Gård"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Om Matland Gård</h1>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Matland Gård ligg vakkert til i Holmefjord på Sunnhordland, med utsikt over fjorden og omgjeven av vakker natur. Vi er ein familiebedrift som brenn for å levere produkt og tenester av høgaste kvalitet.
                </p>
                <p>
                  Gjennom samarbeid med Skjold Singel & Stein tilbyr vi eit utval av eksklusive steinprodukt med unik farge og kvalitet, levert direkte til deg.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About the Stone Shop */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Matland Singel & Stein</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Produkta våre</h3>
              <p className="text-gray-600 mb-4">
                Vi er forhandlar av steinprodukt frå Skjold Singel & Stein på Haugalandet. Steinane våre har ein unik beigefarge som du ikkje finn andre stader, og vi leverer til heile Noreg.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">✓</span>
                  <span>Herregårdssingel – eksklusiv singel i lys beigefarge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">✓</span>
                  <span>Herregårdsgrus – fast dekke med same fine farge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">✓</span>
                  <span>Elvestein – lys granitt til hagar og bed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">✓</span>
                  <span>Sand – til alle føremål og sandkasse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">✓</span>
                  <span>Singelmatter ECCOgravel – stabiliseringsmatter</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kvifor velje oss?</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong className="text-gray-900">Unik kvalitet:</strong> Steinen vår er teken ut i Skjold på Haugalandet og har ein unik beigefarge med brun nyanse som gir uteområdet eit eksklusivt inntrykk.
                </p>
                <p>
                  <strong className="text-gray-900">Levering til heile Noreg:</strong> Vi kan levere steinprodukt til heile landet, med konkurransedyktige fraktprisar.
                </p>
                <p>
                  <strong className="text-gray-900">Personleg service:</strong> Vi er alltid tilgjengelege for råd og rettleiing. Ta kontakt for ein hyggeleg steinprat!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Kontakt oss</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefon</h3>
              <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline text-lg">
                +47 954 58 563
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">E-post</h3>
              <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline text-lg">
                matlandgard@gmail.com
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600 text-lg">
                Ådlandsvegen 30<br />
                5642 Holmefjord
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
