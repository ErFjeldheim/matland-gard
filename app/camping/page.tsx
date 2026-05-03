import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function CampingPage() {
  const facilitiesItems = [
    'Sanitærbygg med dusj og toalett',
    'Straum til bubil/campingvogn',
    'Vassfylling',
    'Vaskemaskin og tørketrommel',
    'WiFi',
    'Bålpanne',
    'Brannsløkkingsapparat og hjartestartar',
  ];

  const activitiesItems = [
    'Båt, kajakk og SUP utleie',
    'Vannsport (vannski og ring)',
    'Guida fjordturar',
    'Besøksgård med dyr',
  ];

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
            src="/images/hero/gard-oversikt.jpg"
            alt="Bobilparkering - Opplev naturen ved fjorden"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Bobilparkering</h2>
              <p className="text-2xl">Opplev naturen ved fjorden</p>
              <p className="text-xl mt-2 text-[var(--color-accent)] font-semibold">Sesong: April - Oktober</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/camping/kai.jpg"
                  alt="Kai"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/camping/campingbil.jpg"
                  alt="Bobil"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md col-span-2">
                <Image
                  src="/images/hero/kayak.jpg"
                  alt="Kajakk"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">Velkomen til Matland Fjordcamp</h3>
            <p className="text-gray-800 mb-4">
              Matland Gård ved Ådlandsfjorden tilbyr idyllisk overnatting for bubilar i rolege omgjevnader heilt nede ved sjøkanten. Her kan gjester nyte spektakulær utsikt og nytte marinaen, som har både badestrand og stupetårn.
            </p>
            <p className="text-gray-800 mb-4">
              Det er gode moglegheiter for aktivitetar som fjellturar, fiske i elv og sjø, samt leige av båt eller kajakk. Vertskapet tilbyr også guida båtturar. Gjestane kan bestilla skyss tur/retur med båt til Os for å ta buss til Bergen. Sjå eigen plakat med prisar og informasjon.
            </p>
            <p className="text-gray-800 mb-4">
              Gjestane kan besøke dyra på gården. Her er det høner, hester, kaniner, sauer, hunder og katter. Det er leikeplass i hagen ved kårhuset på gården.
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">Fasilitetar</h4>
              <ul className="text-gray-900 space-y-2">
                {facilitiesItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
              <h4 className="font-bold text-[var(--color-dark)] mb-3">Ordensreglar</h4>
              <ul className="text-gray-900 space-y-2 text-sm">
                <li>• <b>Innsjekk/Utsjekk:</b> Utsjekk innan kl. 12:00. (Ingen frist for innsjekk.)</li>
                <li>• <b>Ro på plassen:</b> Det skal vere ro mellom kl. 23:00 og 07:00.</li>
                <li>• <b>Avfall:</b> Kast bos/avfall i tilviste containerar.</li>
                <li>• <b>Branntryggleik:</b> Grill og bål berre på tilviste plassar.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Bestill opphald</h4>
              <p className="text-gray-800 mb-6">
                Bestilling gjerast enkelt gjennom vår samarbeidspartnar Campio.
              </p>

              <a
                href="https://campio.no/nb/campsite/matland-fjord-camping?rid=66978e05e7f8ff92883c1aaf"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[var(--color-primary)] text-white text-center px-8 py-4 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-bold text-lg mb-4">
                Bestill no via Campio →
              </a>

              <div className="border-t pt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Kontakt oss direkte:</h5>
                <div className="space-y-2 text-gray-800">
                  <p><a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a></p>
                  <p><a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a></p>
                  <p>Ådlandsvegen 30, 5642 Holmefjord</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[var(--color-accent)]/20 border border-[var(--color-primary)] rounded-lg p-6">
              <h5 className="font-bold text-[var(--color-dark)] mb-2">Aktivitetar</h5>
              <ul className="text-gray-900 space-y-1">
                {activitiesItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Prisar</h3>

          <div className="mb-8">
            <h4 className="font-bold text-xl text-gray-900 mb-4">Utleige</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Kajakker</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-800 text-sm">Utleige av kajakk</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">SUP board</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-800 text-sm">Utleige av SUP</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Tobias båt (15fot med 9,9hk)</h5>
                <p className="text-gray-800 text-sm mb-2">Inkl. bensin</p>
                <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600">6t: <span className="text-lg font-bold text-[var(--color-primary)]">900 kr</span></div>
                  <div className="text-sm text-gray-600">12t: <span className="text-lg font-bold text-[var(--color-primary)]">1 350 kr</span></div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Buster båt (15fot med 40hk)</h5>
                <p className="text-gray-800 text-sm mb-2">Inkl. bensin og ekkolodd</p>
                <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600">6t: <span className="text-lg font-bold text-[var(--color-primary)]">1 350 kr</span></div>
                  <div className="text-sm text-gray-600">12t: <span className="text-lg font-bold text-[var(--color-primary)]">2 000 kr</span></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">Overnatting</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Bubilplass/Vognplass</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">450 kr</p>
                <p className="text-gray-800 text-sm">per natt</p>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            * Sjå oppdaterte bobilprisar og tilgjengelegheit på Campio
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
