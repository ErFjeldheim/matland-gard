'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveOrder, captureOrder, declineOrder, refundOrder, updateOrderStatus } from '@/app/actions';

interface ReservationActionsProps {
  orderId: string;
  canApprove: boolean;
  canDecline: boolean;
  canCapture: boolean;
  canMarkDelivered: boolean;
  canRefund: boolean;
  amountText: string;
}

export default function ReservationActions({
  orderId,
  canApprove,
  canDecline,
  canCapture,
  canMarkDelivered,
  canRefund,
  amountText,
}: ReservationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (action: string, task: () => Promise<unknown>, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setLoading(action);
    try {
      await task();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Noe gikk galt');
    } finally {
      setLoading(null);
    }
  };

  const disabled = loading !== null;

  return (
    <div className="flex flex-wrap gap-3">
      {canApprove && (
        <button
          onClick={() => run('approve', () => approveOrder(orderId))}
          disabled={disabled}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-dark)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'approve' ? 'Godkjenner...' : 'Godkjenn forespørsel'}
        </button>
      )}

      {canCapture && (
        <button
          onClick={() =>
            run(
              'capture',
              () => captureOrder(orderId),
              `Trekk ${amountText} og marker ordren som sendt? Kunden får kvittering på e-post.`,
            )
          }
          disabled={disabled}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'capture' ? 'Trekker beløp...' : `Trekk ${amountText} og marker sendt`}
        </button>
      )}

      {canMarkDelivered && (
        <button
          onClick={() => run('delivered', () => updateOrderStatus(orderId, 'delivered'))}
          disabled={disabled}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'delivered' ? 'Lagrer...' : 'Marker levert'}
        </button>
      )}

      {canDecline && (
        <button
          onClick={() =>
            run(
              'decline',
              () => declineOrder(orderId),
              'Avslå forespørselen og frigi reservasjonen? Beløpet blir ikke trukket, og kunden får e-post.',
            )
          }
          disabled={disabled}
          className="bg-white text-red-700 border-2 border-red-300 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'decline' ? 'Avslår...' : 'Avslå og frigi reservasjon'}
        </button>
      )}

      {canRefund && (
        <button
          onClick={() =>
            run(
              'refund',
              () => refundOrder(orderId),
              `Refundere ${amountText} til kunden? Beløpet blir ført tilbake til betalingsmetoden, og kunden får e-post.`,
            )
          }
          disabled={disabled}
          className="bg-white text-gray-800 border-2 border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'refund' ? 'Refunderer...' : `Refunder ${amountText}`}
        </button>
      )}
    </div>
  );
}
