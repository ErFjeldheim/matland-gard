import { prisma } from '@/lib/prisma';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function SingelPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

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

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg p-8 mb-12">
          <h2 className="text-4xl font-bold mb-4">Matland Singel & Stein</h2>
          <p className="text-xl mb-2">Forhandler av Skjold Singel & Stein</p>
          <p className="text-gray-300">
            Vi leverer herregårdssingel, pukk, matjord og andre steinprodukter av høyeste kvalitet direkte til deg i Vestland.
          </p>
        </div>

        {/* Products Section */}
        <h3 className="text-3xl font-bold text-gray-900 mb-8">Våre Produkter</h3>
        
        {products.length === 0 ? (
          <p className="text-gray-600">Ingen produkter tilgjengelig for øyeblikket.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {product.image ? (
                  <div className="relative h-64 bg-gray-200">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-green-700">
                      {(product.price / 100).toFixed(2)} kr
                    </span>
                    <span className="text-gray-500 text-sm ml-2">eks. mva</span>
                    <p className="text-gray-600 text-sm mt-1">
                      {product.name.toLowerCase().includes('grus') ? 'per tonn' : 'per storsekk (800kg)'}
                    </p>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-2">
                    <button className="w-full bg-[#FF5B24] text-white px-6 py-3 rounded-lg hover:bg-[#E64E1B] transition-colors font-semibold flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 80 80" fill="currentColor">
                        <path d="M50.1 35.4L39.9 56.1c-1.5 3-5.7 3-7.2 0L22.5 35.4c-1.5-3 .4-6.6 3.6-6.6h20.4c3.2 0 5.1 3.6 3.6 6.6z"/>
                      </svg>
                      Betal med Vipps
                    </button>
                    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Betal med kort
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Bestilling og levering</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📦 Levering</h4>
              <p className="text-gray-600">
                Vi leverer til hele regionen. Kontakt oss for pris på levering til din adresse.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">💳 Betaling</h4>
              <p className="text-gray-600">
                Vi aksepterer Vipps og alle vanlige betalingskort. Betal trygt online.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📞 Kontakt</h4>
              <p className="text-gray-600">
                Telefon: <a href="tel:+4795458563" className="text-green-700 hover:underline">+47 954 58 563</a><br/>
                E-post: <a href="mailto:matlandgard@gmail.com" className="text-green-700 hover:underline">matlandgard@gmail.com</a><br/>
                Adresse: Ådlandsvegen 30, 5642 Holmefjord
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🏪 Henting</h4>
              <p className="text-gray-600">
                Hent gratis i Holmefjord<br/>
                Ta med egen henger<br/>
                Etter avtale: <a href="tel:+4795458563" className="text-green-700 hover:underline">954 58 563</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matland Gård. Alle rettigheter reservert.</p>
          <p className="text-green-300 text-sm mt-2">Matland Singel & Stein - Forhandler av Skjold Singel & Stein</p>
        </div>
      </footer>
    </div>
  );
}
