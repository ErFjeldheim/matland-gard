import { describe, expect, it } from 'vitest';
import {
  canDeleteOrder,
  getReservationActions,
  isAllowedManualStatus,
  isCaptureDeadlinePassed,
} from '@/lib/order-flow';

const now = new Date('2026-11-05T12:00:00Z');
const inDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

function order(overrides: Partial<Parameters<typeof getReservationActions>[0]> = {}) {
  return {
    status: 'requested',
    reservedAmount: 189900,
    capturedAmount: null,
    captureDeadline: inDays(7),
    ...overrides,
  };
}

describe('getReservationActions', () => {
  it('gives no reservation actions for legacy orders', () => {
    const actions = getReservationActions(order({ reservedAmount: null, status: 'paid' }), now);

    expect(actions).toEqual({
      approve: false,
      decline: false,
      capture: false,
      markDelivered: false,
      refund: false,
    });
  });

  it('allows approve and decline for a new request', () => {
    const actions = getReservationActions(order({ status: 'requested' }), now);

    expect(actions.approve).toBe(true);
    expect(actions.decline).toBe(true);
    expect(actions.capture).toBe(false);
  });

  it('allows capture only for approved orders before the deadline', () => {
    expect(getReservationActions(order({ status: 'approved' }), now).capture).toBe(true);
    expect(
      getReservationActions(order({ status: 'approved', captureDeadline: inDays(-1) }), now).capture,
    ).toBe(false);
    expect(
      getReservationActions(order({ status: 'approved', captureDeadline: null }), now).capture,
    ).toBe(true);
  });

  it('does not allow capture twice', () => {
    const actions = getReservationActions(
      order({ status: 'approved', capturedAmount: 189900 }),
      now,
    );

    expect(actions.capture).toBe(false);
  });

  it('allows marking a captured order as delivered, but no money actions', () => {
    const actions = getReservationActions(order({ status: 'paid', capturedAmount: 189900 }), now);

    expect(actions).toEqual({
      approve: false,
      decline: false,
      capture: false,
      markDelivered: true,
      refund: true,
    });
  });

  it('does not allow decline after capture or after decline', () => {
    expect(getReservationActions(order({ status: 'paid' }), now).decline).toBe(false);
    expect(getReservationActions(order({ status: 'declined' }), now).decline).toBe(false);
  });

  it('allows refund only after money was captured', () => {
    expect(getReservationActions(order({ status: 'paid', capturedAmount: 189900 }), now).refund).toBe(true);
    expect(getReservationActions(order({ status: 'approved' }), now).refund).toBe(false);
    expect(getReservationActions(order({ status: 'declined' }), now).refund).toBe(false);
  });
});

describe('isCaptureDeadlinePassed', () => {
  it('treats a missing deadline as not passed', () => {
    expect(isCaptureDeadlinePassed({ captureDeadline: null }, now)).toBe(false);
  });

  it('treats a deadline at or before now as passed', () => {
    expect(isCaptureDeadlinePassed({ captureDeadline: now }, now)).toBe(true);
    expect(isCaptureDeadlinePassed({ captureDeadline: inDays(-2) }, now)).toBe(true);
    expect(isCaptureDeadlinePassed({ captureDeadline: inDays(2) }, now)).toBe(false);
  });
});

describe('isAllowedManualStatus', () => {
  it('keeps manual status changes for legacy orders', () => {
    expect(isAllowedManualStatus({ status: 'pending', reservedAmount: null }, 'paid')).toBe(true);
    expect(isAllowedManualStatus({ status: 'paid', reservedAmount: null }, 'refunded')).toBe(true);
  });

  it('blocks manual money-related statuses for reservation orders', () => {
    const requested = { status: 'requested', reservedAmount: 1000 };

    expect(isAllowedManualStatus(requested, 'paid')).toBe(false);
    expect(isAllowedManualStatus(requested, 'cancelled')).toBe(false);
    expect(isAllowedManualStatus(requested, 'refunded')).toBe(false);
    expect(isAllowedManualStatus({ status: 'paid', reservedAmount: 1000 }, 'refunded')).toBe(false);
  });

  it('allows processing and delivered after capture', () => {
    const paid = { status: 'paid', reservedAmount: 1000 };

    expect(isAllowedManualStatus(paid, 'processing')).toBe(true);
    expect(isAllowedManualStatus(paid, 'delivered')).toBe(true);
  });
});

describe('canDeleteOrder', () => {
  it('blocks deletion while a reservation is active', () => {
    expect(canDeleteOrder(order({ status: 'requested' }))).toBe(false);
    expect(canDeleteOrder(order({ status: 'approved' }))).toBe(false);
  });

  it('blocks deletion of captured orders', () => {
    expect(canDeleteOrder(order({ status: 'paid', capturedAmount: 189900 }))).toBe(false);
  });

  it('allows deletion after a reservation was released and for legacy orders', () => {
    expect(canDeleteOrder(order({ status: 'declined' }))).toBe(true);
    expect(canDeleteOrder({ status: 'pending', reservedAmount: null, capturedAmount: null, captureDeadline: null })).toBe(true);
  });
});
