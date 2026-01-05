import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Matland Gård</h1>
          <p className="text-green-100 mt-2">Masser av kvalitet - Stein, Pukk og Singel</p>
        </div>
      </header>

      {/* Produkter */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Våre Produkter</h2>
        
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
                  <div className="h-64 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">Ingen bilde</span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-700">
                      {(product.price / 100).toFixed(2)} kr
                    </span>
                    <button className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors">
                      Kontakt oss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Matland Gård. Alle rettigheter reservert.</p>
        </div>
      </footer>
    </div>
  );
}
