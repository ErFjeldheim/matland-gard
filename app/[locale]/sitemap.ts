import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { locales } from '../../i18n/request';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://matlandgard.no';

const staticPages = [
  'arrangement',
  'camping',
  'kontakt',
  'personvern',
  'vilkar',
  'handlekurv',
];

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function sitemap({
  params,
}: {
  params: { locale: string };
}): Promise<MetadataRoute.Sitemap> {
  const { locale } = params;
  
  const validLocale = locales.includes(locale) ? locale : 'nb';
  const localePrefix = validLocale === 'nb' ? '' : `/${validLocale}`;

  const products = await prisma.product.findMany({
    where: { isActive: true, slug: { not: null } },
    select: { slug: true, updatedAt: true },
  });

  return [
    {
      url: `${BASE_URL}${localePrefix}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...staticPages.map((page) => ({
      url: `${BASE_URL}${localePrefix}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${BASE_URL}${localePrefix}/nettbutikk/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
