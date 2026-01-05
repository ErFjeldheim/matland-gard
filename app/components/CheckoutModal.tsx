'use client';

import { useState } from 'react';

interface CheckoutModalProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: 'vipps' | 'stripe';
}

export default function CheckoutModal({ product, isOpen, onClose, paymentMethod }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  if (!isOpen) return null;

  const totalAmount = (product.price * quantity) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/checkout/${paymentMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Noe gikk galt');
      }

      if (paymentMethod === 'stripe') {
        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        // Vipps - redirect to order page
        window.location.href = `/bestilling/${data.orderId}`;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Feil ved bestilling');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bestill {product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Antall {product.name.toLowerCase().includes('grus') ? '(tonn)' : '(storsekker)'}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold"
                  disabled={loading}
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold"
                  disabled={loading}
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Navn *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Ola Nordmann"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">E-post *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="ola@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Telefon *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="+47 123 45 678"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Leveringsadresse (valgfritt)
              </label>
              <textarea
                rows={2}
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="La stå tom for henting i Holmefjord"
                disabled={loading}
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-gray-900">Totalt:</span>
                <span className="font-bold text-green-700">{totalAmount.toFixed(2)} kr</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">eks. mva og levering</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                paymentMethod === 'vipps' ? 'bg-[#FF5B24]' : 'bg-blue-600'
              } text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center`}
            >
              {loading ? (
                'Behandler...'
              ) : (
                <>
                  {paymentMethod === 'vipps' ? (
                    <>
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 80 80" fill="currentColor">
                        <path d="M50.1 35.4L39.9 56.1c-1.5 3-5.7 3-7.2 0L22.5 35.4c-1.5-3 .4-6.6 3.6-6.6h20.4c3.2 0 5.1 3.6 3.6 6.6z"/>
                      </svg>
                      Betal med Vipps
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Betal med kort
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
