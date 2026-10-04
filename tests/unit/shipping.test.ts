import { describe, expect, it } from 'vitest';
import {
  calculateFixedShippingFee,
  isFixedShippingEligible,
  isShippingUnit,
} from '@/lib/shipping';

describe('calculateFixedShippingFee', () => {
  it('charges base price for 2 big bags', () => {
    expect(calculateFixedShippingFee(2)).toBe(1500);
  });

  it('adds extra fee per big bag above 2', () => {
    expect(calculateFixedShippingFee(3)).toBe(2250);
    expect(calculateFixedShippingFee(4)).toBe(3000);
    expect(calculateFixedShippingFee(6)).toBe(4500);
  });

  it('respects custom base and extra settings', () => {
    expect(calculateFixedShippingFee(3, 1000, 500)).toBe(1500);
  });
});

describe('isFixedShippingEligible', () => {
  it('requires at least 2 big bags', () => {
    expect(isFixedShippingEligible(0)).toBe(false);
    expect(isFixedShippingEligible(1)).toBe(false);
    expect(isFixedShippingEligible(2)).toBe(true);
  });
});

describe('isShippingUnit', () => {
  it('counts big bags and tons', () => {
    expect(isShippingUnit('Herregårdssingel (8-16mm)')).toBe(true);
    expect(isShippingUnit('Grus (0-16mm)')).toBe(true);
  });

  it('excludes singelmatter', () => {
    expect(isShippingUnit('Singelmatter ECCOgravel (2cm)')).toBe(false);
  });
});
