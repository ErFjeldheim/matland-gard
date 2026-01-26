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
      slug: 'herregardssingel',
      description: 'Eksklusiv singel med unik farge',
      longDescription: 'Hvorfor velge Herregårdssingel:\n\n- Når du ønsker eit uteområde med særpreg. (Lys beige når singelen er tørr og brun når den er våt.)\n\n- Herregårdssingel er eit godt og rimeligere alternativ til Dansk strand- og elvesingel.\n\n- Herregårdssingel ligger også meir stabilt da steinene er knust og ikkje runde.\n\n- Herregårdssingel blir ikkje så lett forurenset av grønske og sopp som hvit singel blir.\n\n- Eksklusiv singel med unik lys brun/beige farge.',
      price: 162500, // 1625 kr
      stock: 1000, // Default stock
      stockUnit: 'storsekk',
      image: '/images/products/Herregårdssingel/bilde-1.jpg',
      images: [
        '/images/products/Herregårdssingel/bilde-1.jpg',
        '/images/products/Herregårdssingel/bilde-2.jpg',
        '/images/products/Herregårdssingel/bilde-3.jpg',
        '/images/products/Herregårdssingel/bilde-4.jpg',
        '/images/products/Herregårdssingel/bilde-5.jpg',
        '/images/products/Herregårdssingel/bilde-6.jpg',
        '/images/products/Herregårdssingel/bilde-7.jpg',
        '/images/products/Herregårdssingel/beskrivelse-bilde-1.jpg',
        '/images/products/Herregårdssingel/beskrivelse-bilde-2.jpg',
        '/images/products/Herregårdssingel/beskrivelse-bilde-3.jpg',
        '/images/products/Herregårdssingel/minigolfen-familiepark-på-karmøy.jpg',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=xPYXRXSM0CU',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Herregårdsgrus',
      slug: 'herregardsgrus',
      description: 'Når estetikk og funksjonalitet spiller ein rolle.',
      longDescription: 'Når estetikk og funksjonalitet spiller ein rolle.\n\nØnsker du eit fastere dekke i tun eller innkjørsel er Herregårdsgrus eit godt alternativ til singel. På grunn av at den inneholder 0-stoff setter den seg svært godt. Og du får samme fine lyse brun/beige fargen som ved bruk av Herregårdssingelen. Lyser opp uteområdet og blir estetisk mykje finere enn ved bruk av ordinær grå grus.\n\nVed større kvanta kan grusen selges i løst.\n\nHentepris Aksdal: 300kr inkl. mva pr. tonn.\nHentepris Holmefjord: 900kr inkl. mva pr. tonn.',
      price: 150000, // 1500 kr
      stock: 1000,
      stockUnit: 'storsekk',
      image: '/images/products/Herregårdssingel/bilde-1.jpg', // Using same image category for now as it's similar
      images: [
        '/images/products/Herregårdssingel/bilde-1.jpg',
      ],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Grus',
      slug: 'grus',
      description: 'Grus til fundamenter og drenering',
      price: 49900, // 499 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Pukk og grus/bilde-1.jpg',
      images: [
        '/images/products/Pukk og grus/bilde-1.jpg',
        '/images/products/Pukk og grus/bilde-2.jpeg',
        '/images/products/Pukk og grus/bilde-3.jpg',
        '/images/products/Pukk og grus/bilde-4.jpg',
        '/images/products/Pukk og grus/bilde-5.jpg',
      ],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Elvestein',
      slug: 'elvestein',
      description: 'Naturlig rundslipte steiner',
      price: 200000, // 2000 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Elvestein/bilde-1.jpeg',
      images: [
        '/images/products/Elvestein/bilde-1.jpeg',
        '/images/products/Elvestein/bilde-2.png',
        '/images/products/Elvestein/bilde-3.jpeg',
      ],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Sand',
      slug: 'sand',
      description: 'Ren sand med fin lys brun/beige farge',
      longDescription: 'Ren sand med fin lys brun/beige farge som kan brukes til sandkasse, plenstrøssel og støpesand.',
      price: 150000, // 1500 kr
      stock: 1000, // Default stock
      stockUnit: 'tonn',
      image: '/images/products/Sand/bilde-1.jpg',
      images: [
        '/images/products/Sand/bilde-1.jpg',
        '/images/products/Sand/bilde-2.jpg',
      ],
    },

    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Singelmatter ECCOgravel',
      slug: 'singelmatter-eccogravel',
      description: 'Praktiske singelmatter for enkel legging',
      price: 89900, // 899 kr
      stock: 1000, // Default stock
      stockUnit: 'stk.',
      image: '/images/products/Singelmatter ECCOgravel/bilde-1.jpg',
      images: [
        '/images/products/Singelmatter ECCOgravel/bilde-1.jpg',
        '/images/products/Singelmatter ECCOgravel/bilde-2.jpg',
        '/images/products/Singelmatter ECCOgravel/bilde-3.jpg',
        '/images/products/Singelmatter ECCOgravel/bilde-4.jpg',
        '/images/products/Singelmatter ECCOgravel/bilde-5.jpg',
      ],
    },


  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`✅ Opprettet: ${created.name}`);
  }

  console.log('🎉 Produkter ferdig seedet!');

  // Legg til settings
  const settings = [
    { key: 'hero_title', value: 'Velkomen til Matland Gård', type: 'text' },
    { key: 'hero_text', value: 'Vi tilbyr steinprodukt av høgaste kvalitet, bobilparkering ved fjorden, og unike lokale til dine selskap.', type: 'text' },
    { key: 'hero_image_url', value: '/images/hero/gard-oversikt.jpg', type: 'text' },
    { key: 'contact_email', value: 'matlandgard@gmail.com', type: 'text' },
    { key: 'contact_phone', value: '+47 954 58 563', type: 'text' },
    { key: 'contact_address', value: 'Ådlandsvegen 30, 5642 Holmefjord', type: 'text' },
    { key: 'season_text', value: 'April - Oktober', type: 'text' },
    // Fraktpriser
    { key: 'shipping_fixed_1000', value: '1000', type: 'number' },
    { key: 'shipping_fixed_1500', value: '1500', type: 'number' },
    // Produktpriser (eksempel, bør kanskje hentes fra Product model, men settings gir dynamisk overstyring hvis implementert slik)
    { key: 'herregardssingel_price_2-4mm', value: '1999', type: 'number' },
    { key: 'herregardssingel_price_4-8mm', value: '1799', type: 'number' },
    { key: 'herregardssingel_price_8-16mm', value: '1599', type: 'number' },
    { key: 'herregardssingel_price_16-32mm', value: '1599', type: 'number' },
    { key: 'herregardsgrus_price_0-16mm', value: '1500', type: 'number' },
    { key: 'herregardsgrus_price_0-32mm', value: '1500', type: 'number' },
    { key: 'grus_price_0-16mm', value: '599', type: 'number' },
    { key: 'grus_price_0-32mm', value: '599', type: 'number' },
  ];

  for (const setting of settings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.setting.create({ data: setting });
      console.log(`✅ Opprettet setting: ${setting.key}`);
    } else {
      console.log(`ℹ️  Setting finnes allerede: ${setting.key}`);
    }
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
