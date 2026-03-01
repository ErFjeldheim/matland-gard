import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Oppdaterer produkter...');

  // Slett eksisterende produkter
  await prisma.product.deleteMany();
  console.log('Slettet eksisterende produkter');

  // Legg til nye produkter basert på Skjold Singel & Stein
  const products = [
    {
      name: 'Herregårdssingel',
      description: 'Herregårdssingel er en nydelig singel i en lys beigefarge med innslag av gult. Singelen er hentet fra fjell i lys granitt og kan leveres i sorteringer fra 4mm til 32mm. Egner seg perfekt som hagesingel og til å oppgradere private og offentlige uteområder. Leveres i storsekk (800kg). En storsekk dekker 10-15 kvm.',
      price: 162500, // 1625 kr eks. mva per storsekk
      image: null,
    },
    {
      name: 'Kirkegårdssingel',
      description: 'Kirkegårdssingel er en mindre variant (2-4mm). Den lyse steinen gir et pent og elegant inntrykk på stier, bed og rundt gravsteiner. Holder seg pen over tid og er nærmest vedlikeholdsfri. Leveres i storsekk (800kg).',
      price: 200000, // 2000 kr eks. mva per storsekk
      image: null,
    },
    {
      name: 'Elvestein (Kulestein)',
      description: 'Elvestein i lys granitt som kan brukes i hager, bed, langs husveggen og andre uteområder. Et godt og vedlikeholdsfritt alternativ til bark i blomsterbed og skråninger. Drenerer regnvann veldig godt. Leveres i storsekk (800kg).',
      price: 200000, // 2000 kr eks. mva per storsekk
      image: null,
    },
    {
      name: 'Grus 0-16mm',
      description: 'Grus i lys granitt som kan brukes utenfor hus, hjem, offentlige plasser og industribygg. Steinen har en unik beigefarge som gir uteområdet et elegant inntrykk. Leveres per tonn direkte fra knuseverk.',
      price: 49900, // 499 kr eks. mva per tonn
      image: null,
    },
    {
      name: 'Grus 0-32mm',
      description: 'Grov grus i lys granitt. Ideell for fundament og underlag, oppkjørsler, parkeringsplasser og veier. Utmerket for dreneringsprosjekter og erosjonskontroll. Leveres per tonn direkte fra knuseverk.',
      price: 49900, // 499 kr eks. mva per tonn
      image: null,
    },
    {
      name: 'Sand til sandkasse',
      description: 'Sand til sandkasse og barnelek som egner seg godt til å forme og bygge med (0-2mm). Leveres i storsekk (800kg). En storsekk dekker sandkasser fra 120 til 160cm.',
      price: 175000, // 1750 kr eks. mva per storsekk
      image: null,
    },
  ];

  for (const product of products) {
    // Generate slug from product name
    const slug = product.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const created = await prisma.product.create({
      data: {
        ...product,
        slug,
      },
    });
    console.log(`Opprettet: ${created.name} - ${(created.price / 100).toFixed(2)} kr`);
  }

  console.log('Produkter oppdatert!');
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
