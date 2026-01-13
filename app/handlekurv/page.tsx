'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import Navigation from '../components/Navigation';
import CheckoutModal from '../components/CheckoutModal';

export default function HandlekurvPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Handlekorg</h1>
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Handlekorgja er tom</h2>
              <p className="text-gray-600 mb-6">Legg til produkt for å halde fram</p>
              <Link
                href="/nettbutikk"
                className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-semibold"
              >
                Gå til produkt
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Handlekorg</h1>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Tøm handlekorg
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size || 'default'}`}
                  className="bg-white rounded-lg shadow-md p-6 flex gap-6"
                >
                  {/* Product Image */}
                  {item.image && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.productName}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[var(--color-primary)] font-bold">
                        {(item.price / 100).toFixed(0)} kr <span className="text-gray-500 text-sm">inkl. mva.</span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        Delsum: <span className="font-bold text-gray-900">{((item.price * item.quantity) / 100).toFixed(0)} kr</span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                        className="bg-gray-200 text-gray-900 px-3 py-1 rounded hover:bg-gray-300 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-semibold w-8 text-center text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                        className="bg-gray-200 text-gray-900 px-3 py-1 rounded hover:bg-gray-300 font-bold cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="ml-auto text-red-600 hover:text-red-700 cursor-pointer"
                        aria-label="Slett produkt"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Samandrag</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Tal på varer:</span>
                    <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Totalt:</span>
                    <span className="text-2xl font-bold text-[var(--color-primary)]">
                      {(totalPrice / 100).toFixed(0)} kr
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">inkl. mva.</p>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[var(--color-primary)] text-white px-6 py-4 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-semibold flex items-center justify-center text-lg cursor-pointer"
                >
                  Gå til kasse
                </button>

                <Link
                  href="/nettbutikk"
                  className="block text-center text-[var(--color-primary)] hover:text-[var(--color-dark)] font-medium mt-4"
                >
                  ← Hald fram og handle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal for all cart items */}
      {isCheckoutOpen && items.length > 0 && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          product={{
            id: 'cart',
            name: `${items.length} produkt`,
            price: totalPrice,
          }}
          cartItems={items}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}
