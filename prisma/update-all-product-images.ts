import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function updateAllProductImages() {
  try {
    console.log('Oppdaterer alle produktbilder...\n');

    const productsDir = path.join(process.cwd(), 'public/images/products');
    
    // Mapping mellom produktnavn og mapper
    const productMappings = [
      { name: 'Herregårdssingel', folder: 'Herregårdssingel' },
      { name: 'Kirkegårdssingel', folder: 'Kirkegårdssingel' },
      { name: 'Elvestein', folder: 'Elvestein' },
      { name: 'Pukk og grus', folder: 'Pukk og grus' },
      { name: 'Sand', folder: 'Sand' },
      { name: 'Singelmatter ECCOgravel', folder: 'Singelmatter ECCOgravel' },
    ];

    for (const mapping of productMappings) {
      const folderPath = path.join(productsDir, mapping.folder);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`Mappe ikke funnet: ${mapping.folder}`);
        continue;
      }

      // Les alle filer i mappen
      const files = fs.readdirSync(folderPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .sort((a, b) => {
          // Sorter slik at "Bilde 1" kommer først, etc.
          const numA = parseInt(a.match(/\d+/)?.[0] || '999');
          const numB = parseInt(b.match(/\d+/)?.[0] || '999');
          return numA - numB;
        });

      if (files.length === 0) {
        console.log(`Ingen bilder funnet i: ${mapping.folder}`);
        continue;
      }

      // Første bilde er forsidebildet
      const coverImage = `/images/products/${mapping.folder}/${files[0]}`;
      
      // Alle bilder til images-arrayet
      const allImages = files.map(file => `/images/products/${mapping.folder}/${file}`);

      // Oppdater produktet i databasen
      const result = await prisma.product.updateMany({
        where: {
          name: {
            contains: mapping.name,
            mode: 'insensitive'
          }
        },
        data: {
          image: coverImage,
          images: allImages
        }
      });

      if (result.count > 0) {
        console.log(`${mapping.name}:`);
        console.log(`   Forsidebilde: ${coverImage}`);
        console.log(`   Totalt ${allImages.length} bilder`);
      } else {
        console.log(`Produkt ikke funnet i database: ${mapping.name}`);
      }
    }

    // Vis oppdaterte produkter
    console.log('\nAlle produkter etter oppdatering:');
    const products = await prisma.product.findMany({
      select: {
        name: true,
        image: true,
        images: true
      },
      orderBy: { name: 'asc' }
    });

    products.forEach(p => {
      console.log(`\n  ${p.name}:`);
      console.log(`    Forsidebilde: ${p.image || 'Ikke satt'}`);
      console.log(`    Antall bilder: ${p.images.length}`);
    });

  } catch (error) {
    console.error('Feil under oppdatering:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllProductImages();
