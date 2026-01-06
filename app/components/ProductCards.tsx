'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutModal from './CheckoutModal';

type Product = {
  id: string;
  name: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'vipps'>('vipps');

  const handlePaymentClick = (product: Product, method: 'stripe' | 'vipps') => {
    setSelectedProduct(product);
    setPaymentMethod(method);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <Link href={`/singel/${product.id}`}>
              {product.image ? (
                <div className="relative h-64 bg-gray-200 cursor-pointer">
                  <Image
                    src={product.image}
                    alt={product.name}
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
            
            <div className="p-6">
              <Link href={`/singel/${product.id}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-700 transition-colors cursor-pointer">
                  {product.name}
                </h3>
              </Link>
              
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}
              
              <div className="mb-4">
                {product.priceFrom && product.priceTo ? (
                  <>
                    <span className="text-2xl font-bold text-green-700">
                      {Math.round(product.priceFrom / 100)} - {Math.round(product.priceTo / 100)} kr
                    </span>
                    <span className="text-gray-500 text-sm ml-2">inkl. mva</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-green-700">
                      {Math.round(product.price / 100)} kr
                    </span>
                    <span className="text-gray-500 text-sm ml-2">inkl. mva</span>
                  </>
                )}
                <p className="text-gray-600 text-sm mt-1">
                  {product.name.toLowerCase().includes('grus') 
                    ? 'per tonn' 
                    : product.name.toLowerCase().includes('matte')
                    ? 'per m²'
                    : 'per storsekk (800kg)'}
                </p>
              </div>

              {/* Payment Options */}
              <div className="space-y-2">
                <button 
                  onClick={() => handlePaymentClick(product, 'vipps')}
                  className="w-full bg-[#FF5B24] text-white px-6 py-3 rounded-lg hover:bg-[#E64E1B] transition-colors font-semibold flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 80 80" fill="currentColor">
                    <path d="M50.1 35.4L39.9 56.1c-1.5 3-5.7 3-7.2 0L22.5 35.4c-1.5-3 .4-6.6 3.6-6.6h20.4c3.2 0 5.1 3.6 3.6 6.6z"/>
                  </svg>
                  Betal med Vipps
                </button>
                <button 
                  onClick={() => handlePaymentClick(product, 'stripe')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Betal med kort
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </>
  );
}
