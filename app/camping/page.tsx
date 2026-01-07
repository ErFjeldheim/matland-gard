import Navigation from '../components/Navigation';
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
            alt="Matland Fjord Camping - oversikt"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-5xl font-bold mb-4">Matland Fjord Camping</h2>
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

            <h3 className="text-3xl font-bold text-gray-900 mb-6">Velkommen til campingen</h3>
            <p className="text-gray-600 mb-4">
              Matland Fjord Camping ligger idyllisk til ved fjorden med fantastisk utsikt 
              og naturopplevelser rett utenfor døra. Perfekt for familier, par og alle som 
              ønsker en pause fra hverdagen.
            </p>
            <p className="text-gray-600 mb-6">
              Vi tilbyr både campingplasser for bobil/campingvogn og hyggelige hytter 
              med alle bekvemmeligheter.
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">🏖️ Fasiliteter</h4>
              <ul className="text-gray-700 space-y-2">
                <li>• Sanitærbygg med dusj og toalett</li>
                <li>• Strøm på alle campingplasser</li>
                <li>• Lekeplass for barn</li>
                <li>• Badeplass ved fjorden</li>
                <li>• Grillplasser</li>
                <li>• Wifi</li>
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
              <h5 className="font-bold text-[var(--color-dark)] mb-2">🌲 Aktiviteter i området</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Fiske i fjorden</li>
                <li>• Fotturer i fjellet</li>
                <li>• Kajakk-utleie</li>
                <li>• Sykling</li>
                <li>• Bær- og soppturer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Priser (veiledende)</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Teltplass</h4>
              <p className="text-3xl font-bold text-[var(--color-primary)] mb-2">250 kr</p>
              <p className="text-gray-600">per natt</p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Bobil/Campingvogn</h4>
              <p className="text-3xl font-bold text-[var(--color-primary)] mb-2">350 kr</p>
              <p className="text-gray-600">per natt inkl. strøm</p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Hytte</h4>
              <p className="text-3xl font-bold text-[var(--color-primary)] mb-2">fra 800 kr</p>
              <p className="text-gray-600 text-sm">per natt</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            * Se oppdaterte priser og tilgjengelighet på Campio
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-dark)] text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matland Gard. Alle rettigheter reservert.</p>
        </div>
      </footer>
    </div>
  );
}
