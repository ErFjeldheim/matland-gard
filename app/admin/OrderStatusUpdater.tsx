'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const statuses = [
  { value: 'pending', label: 'Venter på betaling' },
  { value: 'paid', label: 'Betalt' },
  { value: 'processing', label: 'Under behandling' },
  { value: 'delivered', label: 'Levert' },
  { value: 'cancelled', label: 'Kansellert' },
];

export default function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(newStatus);
        setMessage('Status oppdatert!');
        setTimeout(() => {
          router.refresh();
          setMessage('');
        }, 1000);
      } else {
        setMessage(data.error || 'Kunne ikke oppdatere status');
      }
    } catch (error) {
      setMessage('Feil ved oppdatering');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    delivered: 'bg-purple-100 text-purple-800 border-purple-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Oppdater status
      </label>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleUpdate(s.value)}
            disabled={loading || status === s.value}
            className={`px-4 py-2 rounded-lg font-medium transition-all border-2 cursor-pointer ${
              status === s.value
                ? statusColors[s.value] + ' cursor-default'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {s.label}
            {status === s.value && ' ✓'}
          </button>
        ))}
      </div>
      {message && (
        <div className={`mt-2 text-sm ${message.includes('Feil') || message.includes('Kunne') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
