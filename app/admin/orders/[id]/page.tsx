import { prisma } from '@/lib/prisma';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import OrderStatusUpdater from '../../OrderStatusUpdater';
import DeleteOrderButton from '../../DeleteOrderButton';
import CopyButton from '../../CopyButton';

export const dynamic = 'force-dynamic';

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';
  
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

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
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-[var(--color-primary)] hover:text-[var(--color-dark)] font-medium"
          >
            ← Tilbake til kontrollpanel
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ordredetaljer</h1>
                <p className="text-gray-600 mt-1">
                  Ordrenummer: <span className="font-mono font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full font-semibold ${statusColor}`}>
                  {statusText}
                </span>
                <DeleteOrderButton orderId={order.id} orderNumber={order.id.slice(0, 8).toUpperCase()} />
              </div>
            </div>

            {/* Status Updater */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="border-l-4 border-[var(--color-primary)] pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Kundeinformasjon</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Navn:</span> {order.customerName}</p>
                  <p><span className="font-medium">E-post:</span> {order.customerEmail}</p>
                  <p><span className="font-medium">Telefon:</span> {order.customerPhone}</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Leveringsinformasjon</h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Metode:</span>{' '}
                    {order.shippingMethod === 'pickup' ? 'Henting i Holmefjord' : 'Levering med tilbud'}
                  </p>
                  {order.deliveryAddress && (
                    <p><span className="font-medium">Adresse:</span> {order.deliveryAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Betalingsinformasjon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Betalingsmetode:</span>
                  <p className="font-medium text-gray-900">
                    {order.paymentMethod === 'vipps' ? 'Vipps' : 'Kort (Stripe)'}
                  </p>
                </div>
                {order.paymentId && (
                  <div>
                    <span className="text-gray-600">Betalings-ID:</span>
                    <div className="flex items-center">
                      <p className="font-mono text-sm text-gray-900 truncate max-w-xs">{order.paymentId}</p>
                      <CopyButton text={order.paymentId} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Produkter</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Antall: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Enhetspris: {(item.price / 100).toLocaleString('nb-NO')} kr</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {((item.price * item.quantity) / 100).toLocaleString('nb-NO')} kr
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-2xl">
                <span className="font-bold text-gray-900">Totalt</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {(order.totalAmount / 100).toLocaleString('nb-NO')} kr
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-right">inkl. mva.</p>
            </div>

            {/* Timestamps */}
            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Opprettet:</span>{' '}
                  {new Date(order.createdAt).toLocaleString('nb-NO')}
                </div>
                <div className="text-right">
                  <span className="font-medium">Sist oppdatert:</span>{' '}
                  {new Date(order.updatedAt).toLocaleString('nb-NO')}
                </div>
              </div>
            </div>

            {/* Vipps Payment Instructions */}
            {order.paymentMethod === 'vipps' && order.status === 'pending' && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-semibold mb-2">Vipps-betaling</p>
                <p className="text-orange-700 text-sm">
                  Kunden skal sende {(order.totalAmount / 100).toLocaleString('nb-NO')} kr til{' '}
                  <span className="font-bold">954 58 563</span>
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  Ordrenummer: <span className="font-mono font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
