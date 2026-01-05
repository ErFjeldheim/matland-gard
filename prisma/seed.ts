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
      name: 'Singel 8-16mm',
      description: 'Perfekt til drenering og grunnarbeid. Vasket og sortert singel av høy kvalitet.',
      price: 45000, // 450 kr
      image: null,
    },
    {
      name: 'Pukk 0-32mm',
      description: 'Knust fjellmasse, ideell til fundamenter og veier. Kraftig og holdbar.',
      price: 35000, // 350 kr
      image: null,
    },
    {
      name: 'Singel 16-32mm',
      description: 'Grov singel til større prosjekter. Utmerket stabilitet og drainage.',
      price: 50000, // 500 kr
      image: null,
    },
    {
      name: 'Matjord Premium',
      description: 'Næringsrik matjord perfekt for hage og grøntanlegg.',
      price: 30000, // 300 kr
      image: null,
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
