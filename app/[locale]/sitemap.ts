import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { locales } from '../../i18n/request';

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sitemap',
    robots: 'noindex, follow',
  };
}

export default async function sitemap({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  
  const validLocale = locales.includes(locale) ? locale : 'nb';
  const localePrefix = validLocale === 'nb' ? '' : `/${validLocale}`;

  const products = await prisma.product.findMany({
    where: { isActive: true, slug: { not: null } },
    select: { slug: true, updatedAt: true },
  });

  const urls = [
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

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified.toISOString()}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
