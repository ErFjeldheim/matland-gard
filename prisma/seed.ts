
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

  // Slett eksisterende produkter (valgfritt - uncomment hvis du vil tømme tabellen først)
  // await prisma.product.deleteMany();
  // console.log('🗑️  Slettet eksisterende produkter');

  // Merk: Vi bruker upsert her for å unngå duplikater hvis man kjører seed flere ganger uten å slette

  const products = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Herregårdssingel",
      description: "Eksklusiv singel med unik farge",
      price: 159900,
      image: "/images/products/Herregårdssingel/bilde-1.jpg",
      createdAt: "2026-01-06T21:27:23.832Z",
      updatedAt: "2026-01-26T22:16:44.552Z",
      images: [
        "/images/products/Herregårdssingel/bilde-1.jpg",
        "/images/products/Herregårdssingel/bilde-2.jpg",
        "/images/products/Herregårdssingel/bilde-3.jpg",
        "/images/products/Herregårdssingel/bilde-4.jpg",
        "/images/products/Herregårdssingel/bilde-5.jpg",
        "/images/products/Herregårdssingel/bilde-6.jpg",
        "/images/products/Herregårdssingel/bilde-7.jpg",
        "/images/products/Herregårdssingel/beskrivelse-bilde-1.jpg",
        "/images/products/Herregårdssingel/beskrivelse-bilde-2.jpg",
        "/images/products/Herregårdssingel/beskrivelse-bilde-3.jpg",
        "/images/products/Herregårdssingel/minigolfen-familiepark-på-karmøy.jpg"
      ],
      longDescription: "Hvorfor velge Herregårdssingel:\n\n- Når du ønsker eit uteområde med særpreg. (Lys beige når singelen er tørr og brun når den er våt.)\n\n- Herregårdssingel er eit godt og rimeligere alternativ til Dansk strand- og elvesingel.\n\n- Herregårdssingel ligger også meir stabilt da steinene er knust og ikkje runde.\n\n- Herregårdssingel blir ikkje så lett forurenset av grønske og sopp som hvit singel blir.\n\n- Eksklusiv singel med unik lys brun/beige farge.",
      videoUrl: "https://www.youtube.com/watch?v=xPYXRXSM0CU",
      stock: 10,
      stockUnit: "storsekk",
      isActive: true,
      slug: "herregardssingel"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Sand",
      description: "Ren sand med fin lys brun/beige farge",
      price: 150000,
      image: "/images/products/Sand/bilde-1.jpg",
      createdAt: "2026-01-06T21:27:23.832Z",
      updatedAt: "2026-01-26T22:27:37.517Z",
      images: [
        "/images/products/Sand/bilde-1.jpg",
        "/images/products/Sand/bilde-2.jpg"
      ],
      longDescription: "Ren sand med fin lys brun/beige farge som kan brukes til sandkasse, plenstrøssel og støpesand.",
      videoUrl: null,
      stock: 1000,
      stockUnit: "tonn",
      isActive: true,
      slug: "sand"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Elvestein",
      description: "Naturlig rundslipte steiner (ca. 60-150mm)",
      price: 200000,
      image: "/images/products/Elvestein/bilde-1.jpeg",
      createdAt: "2026-01-06T21:27:23.832Z",
      updatedAt: "2026-01-26T22:29:50.352Z",
      images: [
        "/images/products/Elvestein/bilde-1.jpeg",
        "/images/products/Elvestein/bilde-2.png",
        "/images/products/Elvestein/bilde-3.jpeg"
      ],
      longDescription: "Naturlig rundslipte steiner fra lokale kilder. Størrelsen er ca. 60-150mm. Perfekt for dekorasjon i hage, rundt huset eller i blomsterbed.",
      videoUrl: null,
      stock: 1000,
      stockUnit: "tonn",
      isActive: true,
      slug: "elvestein"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Grus",
      description: "Naturlig knust stein i ulike fraksjoner. Perfekt som fundamentering, drenering eller til veier.",
      price: 59900,
      image: "/images/products/Pukk og grus/bilde-1.jpg",
      createdAt: "2026-01-06T21:56:50.963Z",
      updatedAt: "2026-01-11T22:12:36.093Z",
      images: [
        "/images/products/Pukk og grus/bilde-1.jpg",
        "/images/products/Pukk og grus/bilde-2.jpeg",
        "/images/products/Pukk og grus/bilde-3.jpg",
        "/images/products/Pukk og grus/bilde-4.jpg",
        "/images/products/Pukk og grus/bilde-5.jpg"
      ],
      longDescription: "Vårt grus er naturlig knust stein som egner seg utmerket til en rekke formål. Produsert fra lokal naturstein og sortert i ulike fraksjoner for å møte dine behov. Ideelt til fundamentering, drenering, veier og anleggsverk. Gruset leveres i Big Bag à 1000 kg.",
      videoUrl: null,
      stock: 1000,
      stockUnit: "tonn",
      isActive: true,
      slug: "grus"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440008",
      name: "Herregårdsgrus",
      description: "Når estetikk og funksjonalitet spiller ein rolle.",
      price: 150000,
      image: "/images/products/Herregårdssingel/bilde-1.jpg",
      createdAt: "2026-01-26T22:22:02.897Z",
      updatedAt: "2026-01-26T22:22:02.897Z",
      images: [
        "/images/products/Herregårdssingel/bilde-1.jpg"
      ],
      longDescription: "Når estetikk og funksjonalitet spiller ein rolle.\n\nØnsker du eit fastere dekke i tun eller innkjørsel er Herregårdsgrus eit godt alternativ til singel. På grunn av at den inneholder 0-stoff setter den seg svært godt. Og du får samme fine lyse brun/beige fargen som ved bruk av Herregårdssingelen. Lyser opp uteområdet og blir estetisk mykje finere enn ved bruk av ordinær grå grus.\n\nVed større kvanta kan grusen selges i løst.\n\nHentepris Aksdal: 300kr inkl. mva pr. tonn.\nHentepris Holmefjord: 900kr inkl. mva pr. tonn.",
      videoUrl: null,
      stock: 1000,
      stockUnit: "storsekk",
      isActive: true,
      slug: "herregardsgrus"
    },
    {
      id: "9c68ced4-f7ac-48a5-9858-18d4060597a0",
      name: "Singelmatter ECCOgravel",
      description: "Stabiliseringsmatter for grus og singel (120x100 cm). Hindrer spor og ugress.",
      price: 24900,
      image: "/images/products/Singelmatter ECCOgravel/bilde-1.jpg",
      createdAt: "2026-01-06T23:10:52.088Z",
      updatedAt: "2026-01-26T22:36:27.152Z",
      images: [
        "/images/products/Singelmatter ECCOgravel/bilde-1.jpg",
        "/images/products/Singelmatter ECCOgravel/bilde-2.jpg",
        "/images/products/Singelmatter ECCOgravel/bilde-3.jpg",
        "/images/products/Singelmatter ECCOgravel/bilde-4.jpg",
        "/images/products/Singelmatter ECCOgravel/bilde-5.jpg"
      ],
      longDescription: "ECCOgravel stabiliseringsmatter gjer det mogleg å ha eit grusdekke som er like fast og stabilt som asfalt. Perfekt for innkjørslar, parkeringsplassar og gangstiar der ein ønsker eit naturleg utsjåande utan at hjul eller føter søkk ned.\n\nKvifor velge ECCOgravel:\n- **Full stabilitet:** Hindrar danning av spor og gjer det enkelt å sykle eller trille barnevogn.\n- **Integrert duk:** Kjem med pålimt ugress-membran (80 g/m²) som slepp vatn gjennom, men stoppar ugress.\n- **Enkel legging:** Platene på 120x100 cm er enkle å tilpasse med sag eller vinkelsliper.\n- **Berekraftig:** Produsert i resirkulert plast og er sjølv 100% resirkulerbar.\n- **Tåler tung belastning:** Når mattene er fylt, tåler dei personbilar og tyngre køyretøy.\n\nTekniske spesifikasjonar:\n- Plateformat: 120 x 100 x 3 cm (1,2 m² per plate).\n- Grusforbruk: ca. 75 kg per m².\n- Anbefalt singelstørrelse: 5 – 25 mm.",
      videoUrl: null,
      stock: 1000,
      stockUnit: "stk.",
      isActive: true,
      slug: "singelmatter-eccogravel"
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
    console.log(`✅ Upserted product: ${product.name}`);
  }

  // Legg til settings
  const settings = [
    {
      id: "77939765-4255-45ef-9b81-311bc63c810e",
      key: "herregardsgrus_price_0-16mm",
      value: "1500",
      type: "number",
      createdAt: "2026-01-26T22:22:02.910Z",
      updatedAt: "2026-01-26T22:22:02.910Z"
    },
    {
      id: "24d40f90-11e5-471b-b2fe-6a6636911e48",
      key: "herregardsgrus_price_0-32mm",
      value: "1500",
      type: "number",
      createdAt: "2026-01-26T22:22:02.913Z",
      updatedAt: "2026-01-26T22:22:02.913Z"
    }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
    console.log(`✅ Upserted setting: ${setting.key}`);
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
