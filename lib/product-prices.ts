import { prisma } from './prisma';

/**
 * Single source of truth for products that are sold in several sizes.
 *
 * Prices are stored in the `Setting` table in kroner (e.g. `1790`) and are
 * returned from this module in øre (e.g. `179000`) so they can be used
 * directly by checkout code and the UI.
 *
 * The defaults below are only used when a setting is missing from the
 * database. They keep the storefront working before the settings are seeded.
 */

export type SizePriceOption = {
  size: string;
  /** Price in øre */
  price: number;
};

export type SizePriceConfig = {
  name: string;
  slug?: string;
  settingPrefix: string;
  sizes: Array<{
    size: string;
    defaultKroner: number;
    /** Overrides `settingPrefix + size` for keys that don't match the size label. */
    settingKey?: string;
  }>;
};

type ProductIdentifier = {
  name: string;
  slug?: string | null;
  price: number;
};

const SIZE_PRICE_CONFIGS: SizePriceConfig[] = [
  {
    name: 'Herregårdssingel',
    slug: 'herregardssingel',
    settingPrefix: 'herregardssingel_price_',
    sizes: [
      { size: '2-4mm', defaultKroner: 1890 },
      { size: '4-8mm', defaultKroner: 1790 },
      { size: '8-16mm', defaultKroner: 1590 },
      { size: '16-32mm', defaultKroner: 1490 },
    ],
  },
  {
    name: 'Grus',
    settingPrefix: 'grus_price_',
    sizes: [
      { size: '0-16mm', defaultKroner: 599 },
      { size: '0-32mm', defaultKroner: 599 },
    ],
  },
  {
    name: 'Herregårdsgrus',
    slug: 'herregardsgrus',
    settingPrefix: 'herregardsgrus_price_',
    sizes: [
      { size: '0-16mm', defaultKroner: 1500 },
      { size: '0-32mm', defaultKroner: 1500 },
    ],
  },
  {
    name: 'Sand til toppdressing og sandkasse',
    slug: 'sand',
    settingPrefix: 'sand_price_',
    sizes: [
      {
        size: 'Sand til toppdressing og sandkasse (0-2mm)',
        defaultKroner: 1490,
        settingKey: 'sand_price_0-2mm',
      },
    ],
  },
  {
    name: 'Elvestein',
    slug: 'elvestein',
    settingPrefix: 'elvestein_price_',
    sizes: [{ size: '60-90mm', defaultKroner: 3990 }],
  },
  {
    name: 'Singelmatter ECCOgravel',
    slug: 'singelmatter-eccogravel',
    settingPrefix: 'singelmatter_price_',
    sizes: [
      { size: '2cm', defaultKroner: 199, settingKey: 'singelmatter_price_2cm' },
      { size: '3cm', defaultKroner: 229, settingKey: 'singelmatter_price_3cm' },
    ],
  },
];

export function getSizePriceConfig(
  product: Pick<ProductIdentifier, 'name' | 'slug'>,
): SizePriceConfig | undefined {
  return SIZE_PRICE_CONFIGS.find(
    (config) =>
      (config.slug !== undefined && product.slug === config.slug) ||
      product.name === config.name,
  );
}

function settingKeyFor(config: SizePriceConfig, size: SizePriceConfig['sizes'][number]): string {
  return size.settingKey ?? `${config.settingPrefix}${size.size}`;
}

/**
 * Pure resolver so the price calculation can be unit tested without a database.
 */
export function resolveSizePrices(
  config: SizePriceConfig,
  settingValues: ReadonlyMap<string, string>,
): SizePriceOption[] {
  return config.sizes.map((size) => {
    const raw = settingValues.get(settingKeyFor(config, size));
    const parsed = raw === undefined ? Number.NaN : Number.parseFloat(raw);
    const kroner = Number.isFinite(parsed) ? parsed : size.defaultKroner;

    return {
      size: size.size,
      price: Math.round(kroner * 100),
    };
  });
}

export async function getProductSizePrices(
  product: ProductIdentifier,
): Promise<SizePriceOption[]> {
  const config = getSizePriceConfig(product);
  if (!config) return [];

  const keys = config.sizes.map((size) => settingKeyFor(config, size));
  const rows = await prisma.setting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });

  return resolveSizePrices(config, new Map(rows.map((row) => [row.key, row.value])));
}

/**
 * Returns the price in øre for the given size, or `null` when the product
 * does not use size-based pricing.
 */
export async function getProductSizePrice(
  product: ProductIdentifier,
  size?: string | null,
): Promise<number | null> {
  const options = await getProductSizePrices(product);
  if (options.length === 0) return null;
  if (!size) return null;

  return options.find((option) => option.size === size)?.price ?? null;
}

/**
 * Price used when charging a customer. Products with size options must have
 * a valid size so we never fall back to a potentially stale `Product.price`.
 */
export async function getCheckoutUnitPrice(
  product: ProductIdentifier,
  size?: string | null,
): Promise<number> {
  const options = await getProductSizePrices(product);
  if (options.length === 0) return product.price;

  const match = size
    ? options.find((option) => option.size === size)
    : undefined;

  if (!match) {
    throw new Error(`Ugyldig eller manglande storleik for ${product.name}`);
  }

  return match.price;
}

/**
 * Price range in øre for the storefront. Size-based products use their
 * cheapest and most expensive variant; other products use `product.price`.
 */
export async function getProductPriceRange(
  product: ProductIdentifier,
): Promise<{ min: number; max: number }> {
  const options = await getProductSizePrices(product);
  if (options.length === 0) {
    return { min: product.price, max: product.price };
  }

  const prices = options.map((option) => option.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
