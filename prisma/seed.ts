import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starter seeding...');

  // Slett eksisterende produkter (valgfritt)
  await prisma.product.deleteMany();
  console.log('🗑️  Slettet eksisterende produkter');

  // Legg til nye produkter
  const products = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Herregårdssingel',
      description: 'Eksklusiv singel med unik farge',
      longDescription: 'Herregårdssingel er en eksklusiv singel med unik farge og struktur. Perfekt til innkjørsler, stier og som dekorativt dekke. Leveres i tre størrelser.',
      price: 162500, // 1625 kr
      image: '/images/products/herregaardssingel.jpg',
      images: [
        '/images/products/Herregårdssingel/beskrivelse-bilde-1.jpg',
        '/images/products/Herregårdssingel/bilde-1.jpg',
        '/images/products/Herregårdssingel/bilde-2.jpg',
        '/images/products/Herregårdssingel/bilde-3.jpg',
        '/images/products/Herregårdssingel/bilde-4.jpg',
        '/images/products/Herregårdssingel/bilde-5.jpg',
        '/images/products/Herregårdssingel/bilde-6.jpg',
        '/images/products/Herregårdssingel/bilde-7.jpg',
        '/images/products/Herregårdssingel/beskrivelse-bilde-2.jpg',
        '/images/products/Herregårdssingel/beskrivelse-bilde-3.jpg',
        '/images/products/Herregårdssingel/minigolfen-familiepark-på-karmøy.jpg',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=xPYXRXSM0CU',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Kirkegårdssingel',
      description: 'Klassisk hvit singel',
      price: 200000, // 2000 kr
      image: '/images/products/kirkegaardssingel.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Elvestein',
      description: 'Naturlig rundslipte steiner',
      price: 200000, // 2000 kr
      image: '/images/products/elvestein-hauger.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Grus 0-16mm',
      description: 'Fin grus til fundamenter',
      price: 49900, // 499 kr
      image: '/images/products/grus-hauger.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Grus 0-32mm',
      description: 'Grov grus til drenering',
      price: 49900, // 499 kr
      image: '/images/products/grus-hauger.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Sand',
      description: 'Ren sand til lekeplass',
      price: 175000, // 1750 kr
      image: '/images/products/sand-lekelastebil.jpg',
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`✅ Opprettet: ${created.name}`);
  }

  console.log('🎉 Seeding fullført!');
}

main()
  .catch((e) => {
    console.error('❌ Feil under seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
