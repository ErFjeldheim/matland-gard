'use client';

import ProductCards from '@/app/components/ProductCards';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceFrom: number | null;
  priceTo: number | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SingelPageClientProps = {
  products: Product[];
};

export default function SingelPageClient({ products }: SingelPageClientProps) {
  return (
    <>
      {/* Products Section */}
      <h3 className="text-3xl font-bold text-gray-900 mb-8">Våre Produkter</h3>
      
      {products.length === 0 ? (
        <p className="text-gray-600">Ingen produkter tilgjengelig for øyeblikket.</p>
      ) : (
        <ProductCards products={products} />
      )}
    </>
  );
}
