type ReservationFields = {
  status: string;
  reservedAmount: number | null;
  capturedAmount: number | null;
  captureDeadline: Date | null;
};

export type ReservationActions = {
  approve: boolean;
  decline: boolean;
  capture: boolean;
  markDelivered: boolean;
  refund: boolean;
};

const STATUSES_WITH_CAPTURED_MONEY = ['paid', 'processing', 'delivered'];
const MANUAL_STATUSES_AFTER_CAPTURE = ['processing', 'delivered'];

export function isReservationOrder(order: Pick<ReservationFields, 'reservedAmount'>): boolean {
  return order.reservedAmount !== null;
}

export function isCaptureDeadlinePassed(
  order: Pick<ReservationFields, 'captureDeadline'>,
  now: Date,
): boolean {
  return order.captureDeadline !== null && order.captureDeadline.getTime() <= now.getTime();
}

export function getReservationActions(
  order: ReservationFields,
  now: Date = new Date(),
): ReservationActions {
  if (!isReservationOrder(order)) {
    return {
      approve: false,
      decline: false,
      capture: false,
      markDelivered: false,
      refund: false,
    };
  }

  return {
    approve: order.status === 'requested',
    decline: order.status === 'requested' || order.status === 'approved',
    capture:
      order.status === 'approved' &&
      order.capturedAmount === null &&
      !isCaptureDeadlinePassed(order, now),
    markDelivered: order.status === 'paid',
    refund: STATUSES_WITH_CAPTURED_MONEY.includes(order.status) && order.capturedAmount !== null,
  };
}

export function isAllowedManualStatus(
  order: Pick<ReservationFields, 'status' | 'reservedAmount'>,
  nextStatus: string,
): boolean {
  if (!isReservationOrder(order)) return true;

  return (
    STATUSES_WITH_CAPTURED_MONEY.includes(order.status) &&
    MANUAL_STATUSES_AFTER_CAPTURE.includes(nextStatus)
  );
}

export function canDeleteOrder(order: ReservationFields): boolean {
  if (!isReservationOrder(order)) return true;

  return (
    order.status !== 'requested' &&
    order.status !== 'approved' &&
    order.capturedAmount === null
  );
}
