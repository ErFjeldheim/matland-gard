import { describe, expect, it } from 'vitest';
import { getSizePriceConfig, resolveSizePrices } from '@/lib/product-prices';

describe('getSizePriceConfig', () => {
  it('finds Herregårdssingel by slug and name', () => {
    const bySlug = getSizePriceConfig({ name: 'Something else', slug: 'herregardssingel' });
    const byName = getSizePriceConfig({ name: 'Herregårdssingel', slug: null });

    expect(bySlug?.name).toBe('Herregårdssingel');
    expect(byName?.name).toBe('Herregårdssingel');
  });

  it('returns undefined for products without size pricing', () => {
    expect(getSizePriceConfig({ name: 'Dansk strandsingel', slug: 'dansk-strandsingel' })).toBeUndefined();
  });
});

describe('resolveSizePrices', () => {
  it('returns the default prices in øre when no settings exist', () => {
    const config = getSizePriceConfig({ name: 'Herregårdssingel' });

    expect(config).toBeDefined();
    expect(resolveSizePrices(config!, new Map())).toEqual([
      { size: '2-4mm', price: 189000 },
      { size: '4-8mm', price: 179000 },
      { size: '8-16mm', price: 159000 },
      { size: '16-32mm', price: 149000 },
    ]);
  });

  it('uses database settings and falls back per missing size', () => {
    const config = getSizePriceConfig({ name: 'Herregårdssingel' });
    const settings = new Map([
      ['herregardssingel_price_4-8mm', '1750'],
      ['herregardssingel_price_8-16mm', '1550'],
    ]);

    expect(resolveSizePrices(config!, settings)).toEqual([
      { size: '2-4mm', price: 189000 },
      { size: '4-8mm', price: 175000 },
      { size: '8-16mm', price: 155000 },
      { size: '16-32mm', price: 149000 },
    ]);
  });

  it('maps sand and singelmatter to their own setting keys', () => {
    const sand = getSizePriceConfig({ name: 'Sand til toppdressing og sandkasse', slug: 'sand' });
    const mat = getSizePriceConfig({ name: 'Singelmatter ECCOgravel', slug: 'singelmatter-eccogravel' });

    expect(
      resolveSizePrices(sand!, new Map([['sand_price_0-2mm', '1490']])),
    ).toEqual([{ size: 'Sand til toppdressing og sandkasse (0-2mm)', price: 149000 }]);
    expect(
      resolveSizePrices(mat!, new Map([['singelmatter_price_3cm', '229']])),
    ).toEqual([
      { size: '2cm', price: 19900 },
      { size: '3cm', price: 22900 },
    ]);
  });
});
