import { describe, expect, it } from 'vitest';
import { isVippsPaymentCaptured } from '@/app/lib/vipps';

function payment(overrides: {
  state?: 'AUTHORIZED' | 'CAPTURED' | 'EXPIRED';
  amount?: number;
  captured?: number;
}) {
  const amount = overrides.amount ?? 189000;
  return {
    reference: 'order-1',
    state: overrides.state ?? 'AUTHORIZED',
    amount: { value: amount, currency: 'NOK' },
    aggregate: {
      authorizedAmount: { value: amount },
      capturedAmount: { value: overrides.captured ?? 0 },
      cancelledAmount: { value: 0 },
      refundedAmount: { value: 0 },
    },
  };
}

describe('isVippsPaymentCaptured', () => {
  it('treats an authorized payment with no capture as reserved', () => {
    expect(isVippsPaymentCaptured(payment({ state: 'AUTHORIZED' }))).toBe(false);
  });

  it('detects a capture even when Vipps still reports AUTHORIZED', () => {
    expect(isVippsPaymentCaptured(payment({ state: 'AUTHORIZED', captured: 189000 }))).toBe(true);
  });

  it('detects the CAPTURED state', () => {
    expect(isVippsPaymentCaptured(payment({ state: 'CAPTURED', captured: 189000 }))).toBe(true);
  });

  it('does not treat a partial capture as fully captured', () => {
    expect(isVippsPaymentCaptured(payment({ state: 'AUTHORIZED', captured: 100000 }))).toBe(false);
  });

  it('handles a missing aggregate', () => {
    const details = payment({ state: 'AUTHORIZED' });
    delete (details as { aggregate?: unknown }).aggregate;
    expect(isVippsPaymentCaptured(details)).toBe(false);
  });
});
