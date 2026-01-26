import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import SingelPageClient from './SingelPageClient';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function SingelPage() {
  const t = await getTranslations('Shop');

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

  // Sorter slik at Herregårdssingel kommer først og Singelmatter ECCOgravel kommer sist
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
        <SingelPageClient products={products} />

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('info.title')}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📦 {t('info.shipping')}</h4>
              <p className="text-gray-600 mb-2">{t('info.shippingDesc')}</p>
              <ul className="text-gray-600 space-y-1 ml-4">
                {t.raw('info.shippingZones').map((zone: string) => (
                  <li key={zone}>• {zone}</li>
                ))}
              </ul>
              <p className="text-gray-600 mt-3 text-sm">
                <i>{t('info.shippingExample')}</i>
              </p>
              <p className="text-gray-600 mt-2 text-sm italic">
                {t('info.shippingContact')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">💳 {t('info.payment')}</h4>
              <p className="text-gray-600">
                {t('info.paymentDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📞 {t('info.contact')}</h4>
              <p className="text-gray-600">
                Telefon: <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">+47 954 58 563</a><br />
                E-post: <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline">matlandgard@gmail.com</a><br />
                Adresse: Ådlandsvegen 30, 5642 Holmefjord
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🏪 {t('info.pickup')}</h4>
              <p className="text-gray-600">
                {t.rich('info.pickupDesc', {
                  br: () => <br />,
                  tel: (chunks) => <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline">{chunks}</a>
                })}
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
