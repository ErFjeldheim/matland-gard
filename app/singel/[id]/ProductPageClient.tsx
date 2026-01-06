'use client';

import { useState } from 'react';
import CheckoutModal from '@/app/components/CheckoutModal';
import { useCart } from '@/app/context/CartContext';

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

const HERREGAARDSSINGEL_SIZE_OPTIONS = [
  { size: '4-8mm', price: 175000 },
  { size: '8-16mm', price: 150000 },
  { size: '16-32mm', price: 150000 }
];

const GRUS_SIZE_OPTIONS = [
  { size: '0-16mm', price: 59900 },
  { size: '0-32mm', price: 59900 }
];

export default function ProductPageClient({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  
  // Check if this product requires size selection
  const requiresSize = product.name === 'Herregårdssingel' || product.name === 'Grus';
  
  // Get size options based on product
  const getSizeOptions = () => {
    if (product.name === 'Herregårdssingel') return HERREGAARDSSINGEL_SIZE_OPTIONS;
    if (product.name === 'Grus') return GRUS_SIZE_OPTIONS;
    return [];
  };
  
  const SIZE_OPTIONS = getSizeOptions();
  
  // Get price based on selected size
  const getPrice = () => {
    if (!requiresSize) return product.price;
    const sizeOption = SIZE_OPTIONS.find(opt => opt.size === selectedSize);
    return sizeOption ? sizeOption.price : product.price;
  };
  
  const currentPrice = getPrice();
  
  // Get price range for products with size options
  const getPriceRange = () => {
    if (!requiresSize) return null;
    const prices = SIZE_OPTIONS.map(opt => opt.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    // Don't show range if all prices are the same
    if (min === max) return null;
    return { min, max };
  };
  
  const priceRange = getPriceRange();

  const validateSelection = () => {
    if (requiresSize && !selectedSize) {
      alert('Vennligst velg en størrelse før du fortsetter.');
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    
    addItem({
      productId: product.id,
      productName: requiresSize ? `${product.name} (${selectedSize})` : product.name,
      price: currentPrice,
      size: selectedSize || undefined,
      image: product.image || undefined,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1000);
  };

  const handleQuickCheckout = () => {
    if (!validateSelection()) return;
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Price Display */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-baseline mb-2">
          {requiresSize && !selectedSize && priceRange ? (
            <>
              <span className="text-3xl font-bold text-green-700">
                {(priceRange.min / 100).toFixed(0)} - {(priceRange.max / 100).toFixed(0)} kr
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-green-700">
              {(currentPrice / 100).toFixed(0)} kr
            </span>
          )}
          <span className="text-gray-500 text-sm ml-2">inkl. mva.</span>
        </div>
        <p className="text-gray-600 text-sm">
          {product.name.toLowerCase().includes('grus') 
            ? 'per tonn' 
            : product.name.toLowerCase().includes('matte')
            ? 'per m²'
            : 'per storsekk (800kg)'}
        </p>
      </div>

      {requiresSize && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Velg størrelse</h3>
          <div className="grid grid-cols-3 gap-3">
            {SIZE_OPTIONS.map(({ size }) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer ${
                  selectedSize === size
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400 text-gray-700'
                }`}
              >
                <div className="text-sm font-semibold">{size}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center text-lg cursor-pointer"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {addedToCart ? '✓ Lagt til!' : 'Legg til i handlekurv'}
        </button>
        
        <button 
          onClick={handleQuickCheckout}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center text-lg cursor-pointer"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Hurtigbetaling
        </button>
      </div>

      {isModalOpen && (
        <CheckoutModal
          isOpen={isModalOpen}
          product={{
            ...product,
            name: requiresSize ? `${product.name} (${selectedSize})` : product.name,
            price: currentPrice
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
