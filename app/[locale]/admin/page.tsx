import { prisma } from '@/lib/prisma';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Check authentication via Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }
  // Fetch all orders with related data
  const orders = await prisma.order.findMany({
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidOrders = orders.filter(o => o.status === 'paid');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Orders by shipping method
  const pickupOrders = orders.filter(o => o.shippingMethod === 'pickup').length;
  const deliveryOrders = orders.filter(o => o.shippingMethod === 'shipping_quote').length;

  const statusTexts: Record<string, string> = {
    pending: 'Venter på betaling',
    paid: 'Betalt',
    processing: 'Under behandling',
    delivered: 'Levert',
    cancelled: 'Kansellert',
    refunded: 'Refundert',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Kontrollpanel</h1>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/admin/settings"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Innstillingar
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-dark)] transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Administrer produkter
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Totalt Antall Ordrer</h3>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Omsetning</h3>
            <p className="text-3xl font-bold text-[var(--color-primary)]">
              {(totalRevenue / 100).toLocaleString('nb-NO')} kr
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Betalt</h3>
            <p className="text-2xl font-bold text-green-600">
              {(paidRevenue / 100).toLocaleString('nb-NO')} kr
            </p>
            <p className="text-sm text-gray-500 mt-1">{paidOrders.length} ordrer</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Venter på Betaling</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {(pendingRevenue / 100).toLocaleString('nb-NO')} kr
            </p>
            <p className="text-sm text-gray-500 mt-1">{pendingOrders.length} ordrer</p>
          </div>
        </div>

        {/* Shipping Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-900 font-semibold mb-4">Leveringsmetoder</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Henting i Holmefjord</span>
                <span className="font-bold text-gray-900">{pickupOrders} ordrer</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Levering med tilbud</span>
                <span className="font-bold text-gray-900">{deliveryOrders} ordrer</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-900 font-semibold mb-4">Betalingsmetoder</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vipps</span>
                <span className="font-bold text-gray-900">
                  {orders.filter(o => o.paymentMethod === 'vipps').length} ordrer
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kort (Stripe)</span>
                <span className="font-bold text-gray-900">
                  {orders.filter(o => o.paymentMethod === 'stripe').length} ordrer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Alle Ordrer</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordre#
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Levering
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beløp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betaling
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('nb-NO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('nb-NO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="mb-1">
                            {item.product.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {order.shippingMethod === 'pickup' ? 'Henting' : 'Levering'}
                      </span>
                      {order.deliveryAddress && (
                        <div className="text-xs text-gray-500 mt-1">{order.deliveryAddress}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {(order.totalAmount / 100).toLocaleString('nb-NO')} kr
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {order.paymentMethod === 'vipps' ? 'Vipps' : 'Kort'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusTexts[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[var(--color-primary)] hover:text-[var(--color-dark)] font-medium"
                      >
                        Administrer ordre
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Ingen ordrer ennå</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
