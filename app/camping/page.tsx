import Navigation from '../components/Navigation';
import Link from 'next/link';

export default function CampingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/">
            <h1 className="text-4xl font-bold hover:text-green-200 transition-colors cursor-pointer">
              Matland Gård
            </h1>
          </Link>
          <p className="text-green-100 mt-2">Stein • Camping • Arrangement</p>
        </div>
      </header>

      <Navigation />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">Matland Fjord Camping</h2>
          <p className="text-xl mb-8">Opplev naturen ved fjorden</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
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

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
              <h4 className="font-bold text-blue-900 mb-2">🏕️ Fasiliteter</h4>
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
                className="block w-full bg-blue-600 text-white text-center px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg mb-4"
              >
                Book nå via Campio →
              </a>

              <div className="border-t pt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Kontakt oss direkte:</h5>
                <div className="space-y-2 text-gray-600">
                  <p>📞 <a href="tel:+4712345678" className="text-blue-600 hover:underline">+47 123 45 678</a></p>
                  <p>✉️ <a href="mailto:camping@matlandgard.no" className="text-blue-600 hover:underline">camping@matlandgard.no</a></p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h5 className="font-bold text-green-900 mb-2">🌲 Aktiviteter i området</h5>
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
              <p className="text-3xl font-bold text-blue-600 mb-2">250 kr</p>
              <p className="text-gray-600 text-sm">per natt</p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Bobil/Campingvogn</h4>
              <p className="text-3xl font-bold text-blue-600 mb-2">350 kr</p>
              <p className="text-gray-600 text-sm">per natt inkl. strøm</p>
            </div>
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Hytte</h4>
              <p className="text-3xl font-bold text-blue-600 mb-2">fra 800 kr</p>
              <p className="text-gray-600 text-sm">per natt</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            * Se oppdaterte priser og tilgjengelighet på Campio
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matland Gård. Alle rettigheter reservert.</p>
        </div>
      </footer>
    </div>
  );
}
