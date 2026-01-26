'use client';

import ProductCards from '@/app/components/ProductCards';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Shop');

  return (
    <>
      {/* Products Section */}
      <h3 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h3>

      {products.length === 0 ? (
        <p className="text-gray-600">{t('noProducts')}</p>
      ) : (
        <ProductCards products={products} />
      )}
    </>
  );
}
