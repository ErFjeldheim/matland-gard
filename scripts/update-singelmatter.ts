import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REPLACEMENTS: Array<[string, string]> = [
  [
    'Hver matte måler ca. 1x1m og kan beskjæres for å passe perfekt til ditt område.',
    'Mattene måler 80 x 120 cm (2 cm tykkelse, 1 m²) eller 160 x 120 cm (3 cm tykkelse, 2 m²) og kan beskjæres for å passe perfekt til ditt område.',
  ],
  [
    'Panelmål: 120 x 100 x 3 cm',
    'Panelmål: 2 cm = 80 x 120 cm (1 m² per plate), 3 cm = 160 x 120 cm (2 m² per plate)',
  ],
  ['Paneler per m2: 0,87', 'Paneler per m2: 1 (2 cm) / 0,5 (3 cm)'],
  ['M2 pr panel: 1,2 m2', 'M2 pr panel: 1 m² (2 cm) / 2 m² (3 cm)'],
];

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: 'singelmatter-eccogravel' },
  });

  if (!product) {
    throw new Error('Fann ikkje produktet singelmatter-eccogravel');
  }

  let longDescription = product.longDescription ?? '';
  for (const [from, to] of REPLACEMENTS) {
    if (longDescription.includes(from)) {
      longDescription = longDescription.replace(from, to);
    }
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      price: 19900,
      longDescription,
    },
  });

  console.log(`Oppdatert ${updated.name}: price=${updated.price}`);
}

main()
  .catch((e) => {
    console.error('Feil under oppdatering:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
