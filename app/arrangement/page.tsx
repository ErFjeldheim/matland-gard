import Navigation from '../components/Navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ArrangementPage() {
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
            alt="Arrangement lokale ved fjorden"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-primary)]/30 to-transparent flex items-end">
            <div className="p-12 text-white">
              <h2 className="text-5xl font-bold mb-4">Arrangement & Events</h2>
              <p className="text-2xl mb-2">Skaper minnerike stunder</p>
              <p className="text-[var(--color-accent)] text-lg">Perfekt ramme for dine spesielle anledninger</p>
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
                  alt="Scene og lokale"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/hero/utsikt-vann.jpg"
                  alt="Utsikt over vannet"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">Den ominnredde båthallen ved fjorden</h3>
            <p className="text-gray-600 mb-4">
              Matland Gard, med en historie på over 400 år, tilbyr unike lokaler for alle typer arrangementer. 
              Vår ominnredde båthall er den perfekte rammen for minnerike stunder ved fjorden.
            </p>
            <p className="text-gray-600 mb-6">
              Med spektakulær utsikt over fjorden, kombinerer vi tradisjonell arv med moderne komfort 
              og stil. Våre erfarne arrangører hjelper deg med å planlegge og gjennomføre arrangementet 
              fra start til slutt.
            </p>

            <div className="bg-[var(--color-accent)]/20 border-l-4 border-[var(--color-primary)] p-6 mb-6">
              <h4 className="font-bold text-[var(--color-dark)] mb-2">🎉 Vi arrangerer</h4>
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
                <div className="border-l-4 border-[var(--color-primary)] pl-4">
                  <h5 className="font-bold text-gray-900">Båthallen</h5>
                  <p className="text-gray-600 text-sm">Ominnredet til unikt eventlokale</p>
                  <p className="text-gray-600 text-sm">Fleksibel kapasitet for alle typer arrangement</p>
                </div>

                <div className="border-l-4 border-[var(--color-primary)] pl-4">
                  <h5 className="font-bold text-gray-900">Fjordutsikt</h5>
                  <p className="text-gray-600 text-sm">Spektakulær beliggenhet ved vannet</p>
                  <p className="text-gray-600 text-sm">Perfekt for utendørs seremonier</p>
                </div>

                <div className="border-l-4 border-[var(--color-primary)] pl-4">
                  <h5 className="font-bold text-gray-900">Historisk atmosfære</h5>
                  <p className="text-gray-600 text-sm">400 år gammel gård</p>
                  <p className="text-gray-600 text-sm">Tradisjon møter moderne komfort</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Tilleggstjenester</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Catering og mattilbud</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dekking og pynt</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lyd og lysutstyr</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Overnatting for gjester</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--color-primary)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Telefon *</label>
              <input 
                type="tel" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">E-post *</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Type arrangement</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-gray-700">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Antall gjester</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-500 bg-white text-gray-900"
                placeholder="ca. antall"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Melding</label>
              <textarea 
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-500 bg-white text-gray-900"
                placeholder="Fortell oss litt om arrangementet ditt..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-bold text-lg"
              >
                Send forespørsel
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h4 className="font-bold text-gray-900 mb-3">Eller kontakt oss direkte:</h4>
            <div className="space-y-2 text-gray-600">
              <p>📞 <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a></p>
              <p>✉️ <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a></p>
              <p>📍 Ådlandsvegen 30, 5642 Holmefjord</p>
            </div>
          </div>
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
