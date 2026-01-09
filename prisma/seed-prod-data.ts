import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production data...');

  // Clear existing data
  await prisma.product.deleteMany({});

  // Insert products with exact production data
  await prisma.product.createMany({
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Herregårdssingel',
        description: 'Eksklusiv singel med unik farge',
        longDescription: 'Herregårdssingel er en eksklusiv singel med unik farge og struktur. Perfekt til innkjørsler, stier og som dekorativt dekke. Leveres i tre størrelser.',
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
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Grus',
        description: 'Naturlig knust stein i ulike fraksjoner. Perfekt som fundamentering, drenering eller til veier.',
        longDescription: 'Vårt grus er naturlig knust stein som egner seg utmerket til en rekke formål. Produsert fra lokal naturstein og sortert i ulike fraksjoner for å møte dine behov. Ideelt til fundamentering, drenering, veier og anleggsverk. Gruset leveres i Big Bag à 1000 kg.',
        price: 59900,
        image: '/images/products/Pukk og grus/Bilde 1.jpg',
        images: [
          '/images/products/Pukk og grus/Bilde 1.jpg',
          '/images/products/Pukk og grus/Bilde 2.jpeg',
          '/images/products/Pukk og grus/Bilde 3.jpg',
          '/images/products/Pukk og grus/Bilde 4.jpg',
          '/images/products/Pukk og grus/Bilde 5.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:56:50.963Z'),
        updatedAt: new Date('2026-01-06T21:56:50.963Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Elvestein',
        description: 'Naturlig rundslipte steiner',
        longDescription: null,
        price: 200000,
        image: '/images/products/Elvestein/Bilde 1.jpeg',
        images: [
          '/images/products/Elvestein/Bilde 1.jpeg',
          '/images/products/Elvestein/Bilde 2.png',
          '/images/products/Elvestein/Bilde 3.jpeg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Sand',
        description: 'Ren sand til lekeplass',
        longDescription: null,
        price: 175000,
        image: '/images/products/Sand/Bilde 1.jpg',
        images: [
          '/images/products/Sand/Bilde 1.jpg',
          '/images/products/Sand/Bilde 2.jpg',
          '/images/products/Sand/Bilde 3.jpg',
          '/images/products/Sand/Bilde 4.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Kirkegårdssingel',
        description: 'Klassisk hvit singel',
        longDescription: null,
        price: 200000,
        image: '/images/products/Kirkegårdssingel/Bilde 1.jpg',
        images: [
          '/images/products/Kirkegårdssingel/Bilde 1.jpg',
          '/images/products/Kirkegårdssingel/Bilde 2.jpg'
        ],
        videoUrl: null,
        createdAt: new Date('2026-01-06T21:27:23.832Z'),
        updatedAt: new Date('2026-01-06T21:27:23.832Z'),
      },
      {
        id: '9c68ced4-f7ac-48a5-9858-18d4060597a0',
        name: 'Singelmatter ECCOgravel',
        description: 'Praktisk matte for sikker plassering av singel. Hindrer ugress og gir god drenering. Pris per m².',
        longDescription: null,
        price: 24900,
        image: '/images/products/Singelmatter ECCOgravel/Bilde 1.jpg',
        images: [
          '/images/products/Singelmatter ECCOgravel/Bilde 1.jpg',
          '/images/products/Singelmatter ECCOgravel/Bilde 2.jpg',
          '/images/products/Singelmatter ECCOgravel/Bilde 3.jpg',
          '/images/products/Singelmatter ECCOgravel/Bilde 4.jpg',
          '/images/products/Singelmatter ECCOgravel/Bilde 5.jpg'
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
