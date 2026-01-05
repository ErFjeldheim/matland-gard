import Navigation from '../components/Navigation';
import Link from 'next/link';

export default function ArrangementPage() {
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-12 mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">Arrangement & Events</h2>
          <p className="text-xl mb-2">Skaper minnerike stunder</p>
          <p className="text-purple-200">Perfekt ramme for dine spesielle anledninger</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Ditt eventlokale i naturskjønne omgivelser</h3>
            <p className="text-gray-600 mb-4">
              Matland Gård tilbyr unike lokaler for alle typer arrangementer. Med spektakulær 
              utsikt over fjorden og fleksible løsninger, skaper vi den perfekte rammen rundt 
              din spesielle dag.
            </p>
            <p className="text-gray-600 mb-6">
              Våre erfarne arrangører hjelper deg med å planlegge og gjennomføre arrangementet 
              fra start til slutt.
            </p>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mb-6">
              <h4 className="font-bold text-purple-900 mb-2">🎉 Vi arrangerer</h4>
              <ul className="text-gray-700 space-y-2">
                <li>• Bryllup og bryllupsfester</li>
                <li>• Konfirmasjoner og dåp</li>
                <li>• Bursdagsfester og jubileer</li>
                <li>• Firmafester og konferanser</li>
                <li>• Julebord og sommerfester</li>
                <li>• Private middager og sammenkomster</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Våre lokaler</h4>
              
              <div className="space-y-4">
                <div className="border-l-4 border-purple-600 pl-4">
                  <h5 className="font-bold text-gray-900">Festsalen</h5>
                  <p className="text-gray-600 text-sm">Kapasitet: opptil 120 personer</p>
                  <p className="text-gray-600 text-sm">Perfekt for store feiringer</p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <h5 className="font-bold text-gray-900">Fjordstua</h5>
                  <p className="text-gray-600 text-sm">Kapasitet: 40-60 personer</p>
                  <p className="text-gray-600 text-sm">Koselig og intimt</p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <h5 className="font-bold text-gray-900">Uteområde</h5>
                  <p className="text-gray-600 text-sm">Kapasitet: fleksibel</p>
                  <p className="text-gray-600 text-sm">Sommerfester og utendørs arrangementer</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Tilleggstjenester</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Catering og mattilbud</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dekking og pynt</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lyd og lysutstyr</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Overnatting for gjester</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Parkeringsplasser</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Send oss en forespørsel</h3>
          <p className="text-gray-600 mb-6">
            Fyll ut skjemaet under, så kontakter vi deg for å diskutere ditt arrangement.
          </p>
          
          <form className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Navn *</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Telefon *</label>
              <input 
                type="tel" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">E-post *</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Type arrangement</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                <option>Bryllup</option>
                <option>Konfirmasjon</option>
                <option>Bursdag</option>
                <option>Firmafest</option>
                <option>Annet</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Dato</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Antall gjester</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="ca. antall"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Melding</label>
              <textarea 
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Fortell oss litt om arrangementet ditt..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg"
              >
                Send forespørsel
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h4 className="font-bold text-gray-900 mb-3">Eller kontakt oss direkte:</h4>
            <div className="space-y-2 text-gray-600">
              <p>📞 <a href="tel:+4712345678" className="text-purple-600 hover:underline">+47 123 45 678</a></p>
              <p>✉️ <a href="mailto:arrangement@matlandgard.no" className="text-purple-600 hover:underline">arrangement@matlandgard.no</a></p>
            </div>
          </div>
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
