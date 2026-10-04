import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import SingelPageClient from './SingelPageClient';
import FreeInspectionBanner from '@/app/components/FreeInspectionBanner';

export const dynamic = 'force-dynamic';

export default async function SingelPage() {
  const allProducts = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0,
      },
      isActive: true,
      slug: {
        not: null,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = allProducts
    .filter((p): p is typeof p & { slug: string } => p.slug !== null)
    .sort((a, b) => {
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
        <div className="mb-12">
          <FreeInspectionBanner />
        </div>

        <SingelPageClient products={products} />

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Bestilling og levering</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Fastpris på frakt</h4>
              <p className="text-gray-600 mb-2">
                1500 kr inkl. mva for 2 big bags – levering til heile landet. Deretter 750 kr inkl. mva per ekstra big bag.
              </p>
              <p className="text-gray-600 mt-2 text-sm italic">
                Ved større bestillingar kan frakten avvike – vi tek kontakt dersom justering er nødvendig.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Betaling</h4>
              <p className="text-gray-600">
                Vi aksepterer Vipps og alle vanlege betalingskort. Betal trygt på nett.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Kontakt</h4>
              <p className="text-gray-600">
                Telefon: <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a><br />
                E-post: <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a><br />
                Adresse: Ådlandsvegen 30, 5642 Holmefjord
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Henting</h4>
              <p className="text-gray-600">
                Hent sjølv i Holmefjord eller på Skur 25 Møhlenpriskaien 8, 5006 BERGEN.<br />
                Ta med eigen henger.<br />
                Området er inngjerdet, så varene står trygt.<br />
                Etter avtale: <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">954 58 563</a>
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
