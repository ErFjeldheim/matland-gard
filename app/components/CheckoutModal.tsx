'use client';

import { useState } from 'react';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface CheckoutModalProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[]; // Optional: if provided, we're checking out the entire cart
}

export default function CheckoutModal({ product, isOpen, onClose, cartItems }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'vipps' | 'stripe' | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'shipping_quote' | 'pickup' | 'shipping_fixed_1000' | 'shipping_fixed_1500' | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  if (!isOpen) return null;

  const isCartCheckout = cartItems && cartItems.length > 0;

  // Calculate total units (storsekker or tons of grus)
  const totalUnits = isCartCheckout
    ? cartItems.reduce((sum, item) => {
      const name = item.productName.toLowerCase();
      const isUnit = !name.includes('matte'); // Everything except mattene counts as a unit (bag or ton)
      return isUnit ? sum + item.quantity : sum;
    }, 0)
    : (!product.name.toLowerCase().includes('matte') ? quantity : 0);

  const getShippingFee = () => {
    const multiplier = totalUnits;
    if (shippingMethod === 'shipping_fixed_1000') return 1000 * multiplier;
    if (shippingMethod === 'shipping_fixed_1500') return 1500 * multiplier;
    return 0;
  };

  const baseAmount = isCartCheckout ? product.price / 100 : (product.price * quantity) / 100;
  const shippingFee = getShippingFee();
  const totalAmount = baseAmount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingMethod) {
      alert('Ver vennleg og vel leveringsalternativ');
      return;
    }

    if (!paymentMethod) {
      alert('Ver vennleg og vel betalingsmetode');
      return;
    }

    setLoading(true);

    try {
      const requestBody = isCartCheckout
        ? {
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
          })),
          ...formData,
          shippingMethod,
        }
        : {
          productId: product.id,
          quantity,
          ...formData,
          shippingMethod,
        };

      const response = await fetch(`/api/checkout/${paymentMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Noko gjekk galt');
      }

      if (paymentMethod === 'stripe') {
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        window.location.href = `/bestilling/${data.orderId}`;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Feil ved bestilling');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-dark)] fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--foreground)] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bestill {product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cart Items Summary or Quantity Selector */}
            {isCartCheckout ? (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Vareoppsummering
                </label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${item.size || 'default'}-${index}`} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.productName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">×{item.quantity}</span>
                        <span className="font-semibold text-gray-900 min-w-[70px] text-right">
                          {((item.price * item.quantity) / 100).toFixed(0)} kr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  For å endre antall eller fjerne varer, gå tilbake til handlekorgja.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Antall {product.name.toLowerCase().includes('grus') ? '(tonn)' : '(storsekker)'}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold cursor-pointer"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-12 text-center text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold cursor-pointer"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Customer Info */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Namn *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="ola@eksempel.no"
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
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="+47 123 45 678"
                disabled={loading}
              />
            </div>

            {/* Shipping Method Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">Velg leveringsalternativ *</label>
              <div className="space-y-3">
                {/* Region A */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('shipping_fixed_1000')}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer text-left ${shippingMethod === 'shipping_fixed_1000'
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/20 text-[var(--color-dark)]'
                    : 'border-gray-300 hover:border-[var(--color-primary)] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Frakt: Sone 1</div>
                  <div className="text-xs text-gray-600">Bergen, Vaksdal, Samnanger, Bjørnafjorden, Austevoll</div>
                  <div className="text-sm font-bold text-[var(--color-primary)]">{1000 * totalUnits} kr</div>
                </button>

                {/* Region B */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('shipping_fixed_1500')}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer text-left ${shippingMethod === 'shipping_fixed_1500'
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/20 text-[var(--color-dark)]'
                    : 'border-gray-300 hover:border-[var(--color-primary)] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Frakt: Sone 2</div>
                  <div className="text-xs text-gray-600">Sotra, Askøy, Øygarden, Voss</div>
                  <div className="text-sm font-bold text-[var(--color-primary)]">{1500 * totalUnits} kr</div>
                </button>

                {/* Quote */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('shipping_quote')}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer text-left ${shippingMethod === 'shipping_quote'
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/20 text-[var(--color-dark)]'
                    : 'border-gray-300 hover:border-[var(--color-primary)] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Andre område</div>
                  <div className="text-xs text-gray-600">Vi kontaktar deg for pris på frakt</div>
                  <div className="text-sm font-bold text-green-600">Få tilbod</div>
                </button>

                {/* Pickup */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('pickup')}
                  className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer text-left ${shippingMethod === 'pickup'
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/20 text-[var(--color-dark)]'
                    : 'border-gray-300 hover:border-[var(--color-primary)] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <div className="font-semibold">Hent sjølv i Holmefjord</div>
                  <div className="text-sm font-bold text-green-600">Gratis</div>
                </button>

                {totalUnits >= 3 && (
                  <p className="text-xs text-amber-600 font-medium">
                    💡 Tips: Sidan du har 3 eller fleire einingar, kan det løna seg å be om eitt samla tilbod på frakt (vel "Andre område" ovanfor).
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            {(shippingMethod && shippingMethod !== 'pickup') && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Leveringsadresse *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Skriv inn leveringsadressa"
                  disabled={loading}
                />
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delsum varer:</span>
                  <span>{baseAmount.toFixed(0)} kr</span>
                </div>
                {shippingFee > 0 && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Frakt:</span>
                    <span>{shippingFee.toFixed(0)} kr</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl mt-2">
                  <span className="font-bold text-gray-900">Totalt:</span>
                  <span className="font-bold text-[var(--color-primary)]">{totalAmount.toFixed(0)} kr</span>
                </div>
                <p className="text-xs text-gray-500">inkl. mva.</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">Vel betalingsmetode *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('vipps')}
                  className={`py-4 px-4 rounded-lg border-2 font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${paymentMethod === 'vipps'
                    ? 'border-[#FF5B24] bg-[#FFF5F3] text-[#FF5B24]'
                    : 'border-gray-300 hover:border-[#FF5B24] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <span className="text-sm">Vipps</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`py-4 px-4 rounded-lg border-2 font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${paymentMethod === 'stripe'
                    ? 'border-[var(--color-primary)] bg-[var(--color-accent)]/20 text-[var(--color-dark)]'
                    : 'border-gray-300 hover:border-[var(--color-primary)] text-gray-700'
                    }`}
                  disabled={loading}
                >
                  <span className="text-sm">Kort</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !paymentMethod || !shippingMethod}
              className={`w-full ${!paymentMethod || !shippingMethod ? 'bg-gray-400' : paymentMethod === 'vipps' ? 'bg-[#FF5B24] hover:bg-[#E64E1B]' : 'bg-[var(--color-primary)] hover:bg-[var(--color-dark)]'
                } text-white px-6 py-4 rounded-lg transition-colors font-semibold flex items-center justify-center text-lg cursor-pointer disabled:cursor-not-allowed`}
            >
              {loading ? (
                'Behandlar...'
              ) : !shippingMethod ? (
                'Vel leveringsalternativ'
              ) : !paymentMethod ? (
                'Vel betalingsmetode'
              ) : (
                'Fullfør bestilling'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
