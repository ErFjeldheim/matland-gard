import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';
import SingelPageClient from './SingelPageClient';

export const dynamic = 'force-dynamic';

export default async function SingelPage() {
  const allProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Sorter slik at Herregårdssingel kommer først og Singelmatter ECCOgravel kommer sist
  const products = allProducts.sort((a, b) => {
    if (a.name.toLowerCase().includes('herregårdssingel')) return -1;
    if (b.name.toLowerCase().includes('herregårdssingel')) return 1;
    if (a.name.toLowerCase().includes('singelmatter')) return 1;
    if (b.name.toLowerCase().includes('singelmatter')) return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-primary)] text-white rounded-lg p-8 mb-12">
          <h2 className="text-4xl font-bold mb-4">Matland Singel & Stein</h2>
          <p className="text-xl mb-2">Forhandler av Skjold Singel & Stein</p>
          <p className="text-gray-300">
            Vi leverer herregårdssingel, pukk, matjord og andre steinprodukter av høyeste kvalitet direkte til deg i Vestland.
          </p>
        </div>

        <SingelPageClient products={products} />

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
                Telefon: <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a><br/>
                E-post: <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a><br/>
                Adresse: Ådlandsvegen 30, 5642 Holmefjord
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🏪 Henting</h4>
              <p className="text-gray-600">
                Hent gratis i Holmefjord<br/>
                Ta med egen henger<br/>
                Etter avtale: <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">954 58 563</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-dark)] text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matland Gard. Alle rettigheter reservert.</p>
          <p className="text-[var(--color-secondary)] text-sm mt-2">Matland Singel & Stein - Forhandler av Skjold Singel & Stein</p>
        </div>
      </footer>
    </div>
  );
}
