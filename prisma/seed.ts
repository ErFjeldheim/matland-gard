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
      stock: 1000, // Default stock
      stockUnit: 'storsekk',
      image: '/images/products/Herregårdssingel/bilde-1.jpg',
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
      name: 'Grus',
      description: 'Grus til fundamenter og drenering',
      price: 49900, // 499 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Pukk og grus/grus-hauger.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Elvestein',
      description: 'Naturlig rundslipte steiner',
      price: 200000, // 2000 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Elvestein/elvestein-hauger.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Sand',
      description: 'Ren sand til lekeplass og bygg',
      price: 175000, // 1750 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Sand/sand-lekelastebil.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Kirkegårdssingel',
      description: 'Klassisk hvit singel',
      price: 200000, // 2000 kr
      stock: 1000, // Default stock
      stockUnit: 'storsekk',
      image: '/images/products/Kirkegårdssingel/kirkegaardssingel.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Singelmatter ECCOgravel',
      description: 'Praktiske singelmatter for enkel legging',
      price: 89900, // 899 kr
      stock: 1000, // Default stock
      stockUnit: 'stk.',
      image: '/images/products/Singelmatter ECCOgravel/singelmatter.jpg',
    },
  ];
      stock: 1000, // Default stock
      image: '/images/products/Singelmatter ECCOgravel/singelmatter.jpg',
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
