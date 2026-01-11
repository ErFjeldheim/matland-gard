import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function CampingPage() {
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
            alt="Matland Fjordcamp - oversikt"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-5xl font-bold mb-4">Matland Fjordcamp</h2>
              <p className="text-2xl">Opplev naturen ved fjorden</p>
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
                  alt="Kai ved fjorden"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/camping/sauer.jpg"
                  alt="Sau på beite"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md col-span-2">
                <Image
                  src="/images/hero/kayak.jpg"
                  alt="Kajakk på fjorden"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">Velkommen til Matland Gård</h3>
            <p className="text-gray-600 mb-4">
              Matland Gård ved Ådlandsfjorden tilbyr idyllisk overnatting for bobiler i rolige 
              omgivelser helt nede ved vannkanten. Her kan gjester nyte spektakulær utsikt og 
              benytte seg av marinaen, som har både badestrand og stupetårn.
            </p>
            <p className="text-gray-600 mb-4">
              Det er gode muligheter for aktiviteter som fjellturer, fiske i elv og sjø, samt 
              leie av båt eller kajakk. Gården tilbyr også guidede turer med yacht til 
              destinasjoner som Austevoll og Hardangerfjordene.
            </p>
            <p className="text-gray-600 mb-4">
              Gjestene kommer tett på gårdslivet med dyr som sauer, hest og påfugler, og det 
              er mulighet for å plukke ferske egg om morgenen. Fasilitetene inkluderer et 
              naust med scene for sosiale sammenkomster.
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">🏖️ Fasiliteter</h4>
              <ul className="text-gray-700 space-y-2">
                <li>• Sanitærbygg med dusj og toalett</li>
                <li>• Strøm til bobil/campingvogn</li>
                <li>• Tømming av toalett</li>
                <li>• Vannfylling</li>
                <li>• Vaskemaskin</li>
                <li>• WiFi</li>
                <li>• Grillplasser og peis</li>
                <li>• Brannslukningsapparat og hjertestarter</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Book din opphold</h4>
              <p className="text-gray-600 mb-6">
                Booking gjøres enkelt gjennom vår samarbeidspartner Campio.
              </p>
              
              <a 
                href="https://campio.no/nb/campsite/matland-fjord-camping?rid=66978e05e7f8ff92883c1aaf"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[var(--color-primary)] text-white text-center px-8 py-4 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-bold text-lg mb-4">
                Book nå via Campio →
              </a>

              <div className="border-t pt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Kontakt oss direkte:</h5>
                <div className="space-y-2 text-gray-600">
                  <p>📞 <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a></p>
                  <p>✉️ <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a></p>
                  <p>📍 Ådlandsvegen 30, 5642 Holmefjord</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[var(--color-accent)]/20 border border-[var(--color-primary)] rounded-lg p-6">
              <h5 className="font-bold text-[var(--color-dark)] mb-2">🌲 Aktiviteter</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Båt- og kajakk-utleie</li>
                <li>• Fiske i fjorden og elva</li>
                <li>• Naturlig strand og stupetårn</li>
                <li>• Fotturer i fjellet</li>
                <li>• Besøksgård med dyr</li>
                <li>• Guidede fjordturer med yacht</li>
                <li>• Musikkarrangementer i båthuset</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Priser</h3>
          
          <div className="mb-8">
            <h4 className="font-bold text-xl text-gray-900 mb-4">Utleie</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Kajakker</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-600 text-sm">Leige av 2 kajakker i 3 timer</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">SUP board</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">200 kr</p>
                <p className="text-gray-600 text-sm">3 timer</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Båt inkl. bensin</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">1 050 kr</p>
                <p className="text-gray-600 text-sm">12 timer</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Båt inkl. bensin</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">700 kr</p>
                <p className="text-gray-600 text-sm">6 timer</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">Overnatting</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Bobilplass/Vognplass</h5>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">350 kr</p>
                <p className="text-gray-600 text-sm">per natt</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mt-4">
            * Se oppdaterte campingpriser og tilgjengelighet på Campio
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
