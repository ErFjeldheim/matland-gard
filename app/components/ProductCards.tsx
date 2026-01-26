'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  price: number;
  image: string | null;
  images: string[];
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProductCardsProps = {
  products: Product[];
};

export default function ProductCards({ products }: ProductCardsProps) {
  const t = useTranslations('Shop');
  const productsT = useTranslations('Products');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <Link href={`/nettbutikk/${product.slug}`}>
              {product.image ? (
                <div className="relative h-64 bg-gray-200 cursor-pointer">
                  <Image
                    src={product.image}
                    alt={productsT(`${product.slug}.name`, { defaultValue: product.name })}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center cursor-pointer">
                  <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </Link>

            <div className="p-6 flex flex-col flex-grow">
              <Link href={`/nettbutikk/${product.slug}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                  {productsT(`${product.slug}.name`, { defaultValue: product.name })}
                </h3>
              </Link>

              <p className="text-gray-800 mb-4">{productsT(`${product.slug}.description`, { defaultValue: product.description || '' })}</p>

              <div className="mb-4 mt-auto">
                <div>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {Math.round(product.price / 100)} kr
                  </span>
                  <span className="text-gray-500 text-sm ml-1">{t('inclVat')}</span>
                </div>
                <p className="text-gray-600 text-sm">
                  {product.name.toLowerCase().includes('grus')
                    ? t('perTonn')
                    : product.name.toLowerCase().includes('matte')
                      ? t('perM2')
                      : t('perBag')}
                </p>
              </div>

              {/* Call to Action */}
              <Link
                href={`/nettbutikk/${product.slug}`}
                className="block w-full bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-secondary)] active:bg-[var(--color-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition-all font-semibold text-center shadow-sm hover:shadow-md"
              >
                {t('viewProduct')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
