import { prisma } from '@/lib/prisma';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LogoutButton from '../LogoutButton';
import StockUpdater from './StockUpdater';
import ActiveToggle from './ActiveToggle';
import PriceUpdater from './PriceUpdater';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  // Check authentication
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin-auth')?.value === 'authenticated';

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  // Fetch all products (including out of stock)
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Produktadministrasjon</h1>
            <Link href="/admin" className="text-[var(--color-primary)] hover:underline mt-2 inline-block">
              ← Tilbake til kontrollpanel
            </Link>
          </div>
          <LogoutButton />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Alle Produkter</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beskrivelse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pris
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lagerbeholdning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktiv
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {product.description || 'Ingen beskrivelse'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriceUpdater productId={product.id} currentPrice={product.price} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StockUpdater productId={product.id} currentStock={product.stock} stockUnit={product.stockUnit} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActiveToggle productId={product.id} initialActive={product.isActive} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isActive && product.stock > 0 ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Tilgjengelig
                        </span>
                      ) : !product.isActive ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Deaktivert
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Utsolgt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/nettbutikk/${product.slug}`}
                        className="text-[var(--color-primary)] hover:text-[var(--color-dark)] font-medium"
                        target="_blank"
                      >
                        Se produkt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Ingen produkter funnet</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
