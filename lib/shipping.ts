export const SHIPPING_FIXED_BASE_DEFAULT = 1500;
export const SHIPPING_EXTRA_PER_UNIT_DEFAULT = 750;
export const MIN_FIXED_SHIPPING_UNITS = 2;

export function isShippingUnit(productName: string): boolean {
  return !productName.toLowerCase().includes('matte');
}

export function isFixedShippingEligible(unitCount: number): boolean {
  return unitCount >= MIN_FIXED_SHIPPING_UNITS;
}

export function calculateFixedShippingFee(
  unitCount: number,
  base = SHIPPING_FIXED_BASE_DEFAULT,
  extraPerUnit = SHIPPING_EXTRA_PER_UNIT_DEFAULT,
): number {
  return base + Math.max(0, unitCount - MIN_FIXED_SHIPPING_UNITS) * extraPerUnit;
}

export function getShippingMethodLabel(method: string | null | undefined): string {
  switch (method) {
    case 'pickup':
      return 'Henting i Holmefjord';
    case 'pickup_dokken':
      return 'Henting Skur 25 Møhlenpriskaien 8';
    case 'shipping_fixed':
      return 'Fastpris frakt (heile landet)';
    case 'shipping_quote':
      return 'Vi sender tilbud på frakt';
    case 'shipping_fixed_1250':
      return 'Fastpris frakt (Sone 1)';
    case 'shipping_fixed_1875':
      return 'Fastpris frakt (Sone 2)';
    default:
      return 'Frakt';
  }
}
