'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrder } from '@/app/actions';

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

export default function DeleteOrderButton({ orderId, orderNumber }: DeleteOrderButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteOrder(orderId);
      // Determine redirection based on current path? 
      // The server action revalidates /admin.
      // Ideally we shouldn't need to manually push if we are on the list page, 
      // but if we are on the detail page, we should redirect.
      // Assuming this button is used on detail page mainly or list page.
      // If on list page, revalidatePath is enough. If on detail page, we need to go back.
      // The original code did router.push('/admin').
      router.push('/admin');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Feil ved sletting av ordre');
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-[var(--color-background)] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bekreft sletting</h3>
          <p className="text-gray-600 mb-6">
            Er du sikker på at du vil slette ordre <span className="font-mono font-bold">{orderNumber}</span>?
            <br />
            <span className="text-red-600 font-medium">Denne handlingen kan ikke angres.</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-[var(--color-dark)] text-white px-4 py-3 rounded-lg hover:bg-[var(--color-primary)] transition-colors font-medium cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sletter...' : 'Slett ordre'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-[var(--color-dark)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)] transition-colors font-medium cursor-pointer"
    >
      Slett ordre
    </button>
  );
}
