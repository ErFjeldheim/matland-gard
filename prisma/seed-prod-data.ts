import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production data...');

  // Clear existing data - delete orders first due to foreign key constraints
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  // Insert products with exact production data
  await prisma.product.createMany({
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Herregårdssingel',
        slug: 'herregardssingel',
        description: 'Eksklusiv singel med unik farge',
        longDescription: 'Hvorfor velge Herregårdssingel:\n\n- Når du ønsker eit uteområde med særpreg. (Lys beige når singelen er tørr og brun når den er våt.)\n\n- Herregårdssingel er eit godt og rimeligere alternativ til Dansk strand- og elvesingel.\n\n- Herregårdssingel ligger også meir stabilt da steinene er knust og ikkje runde.\n\n- Herregårdssingel blir ikkje så lett forurenset av grønske og sopp som hvit singel blir.\n\n- Eksklusiv singel med unik lys brun/beige farge.',
        price: 162500,
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
          '/images/products/Herregårdssingel/minigolfen-familiepark-på-karmøy.jpg'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=xPYXRXSM0CU',
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Herregårdsgrus',
        slug: 'herregardsgrus',
        description: 'Når estetikk og funksjonalitet spiller ein rolle.',
        longDescription: 'Når estetikk og funksjonalitet spiller ein rolle.\n\nØnsker du eit fastere dekke i tun eller innkjørsel er Herregårdsgrus eit godt alternativ til singel. På grunn av at den inneholder 0-stoff setter den seg svært godt. Og du får samme fine lyse brun/beige fargen som ved bruk av Herregårdssingelen. Lyser opp uteområdet og blir estetisk mykje finere enn ved bruk av ordinær grå grus.\n\nVed større kvanta kan grusen selges i løst.\n\nHentepris Aksdal: 300kr inkl. mva pr. tonn.\nHentepris Holmefjord: 900kr inkl. mva pr. tonn.',
        price: 150000,
        image: '/images/products/Herregårdssingel/bilde-1.jpg',
        images: [
          '/images/products/Herregårdssingel/bilde-1.jpg'
        ],
        videoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Grus',
        slug: 'grus',
        description: 'Naturlig knust stein i ulike fraksjoner. Perfekt som fundamentering, drenering eller til veier.',
        longDescription: 'Vårt grus er naturlig knust stein som egner seg utmerket til en rekke formål. Produsert fra lokal naturstein og sortert i ulike fraksjoner for å møte dine behov. Ideelt til fundamentering, drenering, veier og anleggsverk. Gruset leveres i Big Bag à 1000 kg.',
        price: 59900,
        image: '/images/products/Pukk og grus/bilde-1.jpg',
        images: [
          '/images/products/Pukk og grus/bilde-1.jpg',
          '/images/products/Pukk og grus/bilde-2.jpeg',
          '/images/products/Pukk og grus/bilde-3.jpg',
          '/images/products/Pukk og grus/bilde-4.jpg',
          '/images/products/Pukk og grus/bilde-5.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:56:50.963Z'),
        updatedAt: new Date('2026-01-06T21:56:50.963Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Elvestein',
        slug: 'elvestein',
        description: 'Naturlig rundslipte steiner (ca. 60-150mm)',
        longDescription: 'Naturlig rundslipte steiner fra lokale kilder. Størrelsen er ca. 60-150mm. Perfekt for dekorasjon i hage, rundt huset eller i blomsterbed.',
        price: 200000,
        image: '/images/products/Elvestein/bilde-1.jpeg',
        images: [
          '/images/products/Elvestein/bilde-1.jpeg',
          '/images/products/Elvestein/bilde-2.png',
          '/images/products/Elvestein/bilde-3.jpeg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Sand',
        slug: 'sand',
        description: 'Ren sand med fin lys brun/beige farge',
        longDescription: 'Ren sand med fin lys brun/beige farge som kan brukes til sandkasse, plenstrøssel og støpesand.',
        price: 150000,
        image: '/images/products/Sand/bilde-1.jpg',
        images: [
          '/images/products/Sand/bilde-1.jpg',
          '/images/products/Sand/bilde-2.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },

      {
        id: '9c68ced4-f7ac-48a5-9858-18d4060597a0',
        name: 'Singelmatter ECCOgravel',
        slug: 'singelmatter-eccogravel',
        description: 'Praktisk matte for sikker plassering av singel. Hindrer ugress og gir god drenering. Pris per m².',
        longDescription: null,
        price: 24900,
        image: '/images/products/Singelmatter ECCOgravel/bilde-1.jpg',
        images: [
          '/images/products/Singelmatter ECCOgravel/bilde-1.jpg',
          '/images/products/Singelmatter ECCOgravel/bilde-2.jpg',
          '/images/products/Singelmatter ECCOgravel/bilde-3.jpg',
          '/images/products/Singelmatter ECCOgravel/bilde-4.jpg',
          '/images/products/Singelmatter ECCOgravel/bilde-5.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T23:10:52.088Z'),
        updatedAt: new Date('2026-01-06T23:10:52.088Z'),
      },
    ],
  });

  console.log('Production data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
