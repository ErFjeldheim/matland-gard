import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import CheckoutModal from '@/app/components/CheckoutModal';
import ProductPageClient from './ProductPageClient';
import ProductImageGallery from './ProductImageGallery';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-[var(--color-primary)]">Hjem</Link>
          {' > '}
          <Link href="/nettbutikk" className="hover:text-[var(--color-primary)]">Singel & Stein</Link>
          {' > '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          {product.image && (
            <ProductImageGallery
              mainImage={product.image}
              additionalImages={product.images || []}
              productName={product.name}
            />
          )}

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {product.description && (
              <p className="text-lg text-gray-700 mb-6">{product.description}</p>
            )}

            {/* Payment Buttons */}
            <ProductPageClient product={product} />

            {/* Video */}
            {product.videoUrl && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Produktvideo</h3>
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={product.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Long Description */}
        {product.longDescription && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              {product.longDescription.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
