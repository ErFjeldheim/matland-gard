import { prisma } from '@/lib/prisma';
import Navigation from '../../components/Navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const statusTexts: Record<string, string> = {
    pending: 'Venter på betaling',
    paid: 'Betalt',
    processing: 'Under behandling',
    delivered: 'Levert',
    cancelled: 'Kansellert',
  };
  const statusText = statusTexts[order.status] || order.status;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';

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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {order.status === 'paid' ? 'Takk for din bestilling!' : 'Bestilling mottatt'}
            </h2>
            <p className="text-gray-600">
              Ordrenummer: <span className="font-mono font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ordredetaljer</h3>
              <span className={`px-4 py-2 rounded-full font-semibold ${statusColor}`}>
                {statusText}
              </span>
            </div>

            {/* Customer Info */}
            <div className="border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Kundeinformasjon</h4>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Navn:</span> {order.customerName}</p>
                <p><span className="font-medium">E-post:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Telefon:</span> {order.customerPhone}</p>
                {order.deliveryAddress && (
                  <p><span className="font-medium">Leveringsadresse:</span> {order.deliveryAddress}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Produkter</h4>
              <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Antall: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {((item.price * item.quantity) / 100).toFixed(0)} kr
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-900">Totalt</span>
              <span className="font-bold text-green-700">
                {(order.totalAmount / 100).toFixed(0)} kr
              </span>
            </div>

            {/* Payment Info */}
            {order.paymentMethod === 'vipps' && order.status === 'pending' && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-semibold mb-2">Vipps-betaling</p>
                <p className="text-orange-700 text-sm">
                  Send {(order.totalAmount / 100).toFixed(0)} kr til <span className="font-bold">954 58 563</span>
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  Oppgi ordrenummer i meldingen: <span className="font-mono font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-3">Hva skjer nå?</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Vi behandler din bestilling</li>
              <li>Du mottar en e-postbekreftelse</li>
              <li>Vi kontakter deg for å avtale levering/henting</li>
              <li>Du kan hente gratis i Holmefjord eller få levering mot gebyr</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/singel"
              className="flex-1 bg-green-700 text-white text-center px-6 py-3 rounded-lg hover:bg-green-800 transition-colors font-semibold"
            >
              Se flere produkter
            </Link>
            <Link
              href="/"
              className="flex-1 bg-white text-gray-700 text-center px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold border border-gray-300"
            >
              Tilbake til forsiden
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center text-gray-600">
            <p>Spørsmål om din bestilling?</p>
            <p className="mt-2">
              <a href="tel:+4795458563" className="text-green-700 hover:underline font-semibold">
                +47 954 58 563
              </a>
              {' eller '}
              <a href="mailto:matlandgard@gmail.com" className="text-green-700 hover:underline font-semibold">
                matlandgard@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-green-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matland Gård. Alle rettigheter reservert.</p>
        </div>
      </footer>
    </div>
  );
}
