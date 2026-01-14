'use client';

import ProductCards from '@/app/components/ProductCards';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  price: number;
  stock: number;
  stockUnit: string;
  isActive: boolean;
  image: string | null;
  images: string[];
  videoUrl: string | null;
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
      <h3 className="text-3xl font-bold text-gray-900 mb-8">Våre produkt</h3>

      {products.length === 0 ? (
        <p className="text-gray-600">Ingen produkt tilgjengeleg for augneblinken.</p>
      ) : (
        <ProductCards products={products} />
      )}
    </>
  );
}
