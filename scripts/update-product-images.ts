import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateProductImages() {
  try {
    // Oppdater produkter med bildesti
    const updates = [
      { name: 'Herregårdssingel', image: '/images/products/herregaardssingel.jpg' },
      { name: 'Kirkegårdssingel', image: '/images/products/kirkegaardssingel.jpg' },
      { name: 'Elvestein', image: '/images/products/elvestein-hauger.jpg' },
      { name: 'Grus 0-16mm', image: '/images/products/grus-hauger.jpg' },
      { name: 'Grus 0-32mm', image: '/images/products/grus-hauger.jpg' },
      { name: 'Sand', image: '/images/products/sand-lekelastebil.jpg' },
    ];

    for (const update of updates) {
      await prisma.product.updateMany({
        where: { name: update.name },
        data: { image: update.image },
      });
      console.log(`✅ Oppdatert ${update.name} med bilde: ${update.image}`);
    }

    console.log('\n✅ Alle produktbilder oppdatert!');
  } catch (error) {
    console.error('❌ Feil ved oppdatering:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateProductImages();
