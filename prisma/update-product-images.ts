import { prisma } from '../lib/prisma';

async function updateProductImages() {
  try {
    console.log('Oppdaterer produktbilder...');

    // Oppdater Herregårdssingel
    const herregard = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Herregårdssingel',
          mode: 'insensitive'
        }
      },
      data: {
        image: '/images/products/Herregårdssingel/bilde-1.jpg'
      }
    });

    console.log(`Oppdatert ${herregard.count} Herregårdssingel produkt(er)`);

    // Oppdater Kirkegårdssingel
    const kirkegard = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Kirkegårdssingel',
          mode: 'insensitive'
        }
      },
      data: {
        image: '/images/products/Herregårdssingel/bilde-5.jpg'
      }
    });

    console.log(`Oppdatert ${kirkegard.count} Kirkegårdssingel produkt(er)`);

    // Vis oppdaterte produkter
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Herregårdssingel', mode: 'insensitive' } },
          { name: { contains: 'Kirkegårdssingel', mode: 'insensitive' } }
        ]
      },
      select: {
        name: true,
        image: true
      }
    });

    console.log('\nProdukter etter oppdatering:');
    products.forEach(p => {
      console.log(`  - ${p.name}: ${p.image}`);
    });

  } catch (error) {
    console.error('Feil under oppdatering:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();
