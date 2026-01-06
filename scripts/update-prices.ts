import { prisma } from '../lib/prisma';

function roundToPsychologicalPrice(priceInOre: number): number {
  const priceInKr = priceInOre / 100;
  
  // Round to nearest 49 or 99
  const mod100 = priceInKr % 100;
  const base = Math.floor(priceInKr / 100) * 100;
  
  if (mod100 <= 24) {
    // Round down to previous X49
    return base === 0 ? 4900 : (base - 100 + 49) * 100;
  } else if (mod100 <= 74) {
    // Round to X49
    return (base + 49) * 100;
  } else {
    // Round to X99
    return (base + 99) * 100;
  }
}

async function updatePrices() {
  try {
    const products = await prisma.product.findMany();
    
    console.log('Oppdaterer priser for produkter...\n');
    
    for (const product of products) {
      const updates: any = {
        price: roundToPsychologicalPrice(product.price),
      };
      
      if (product.priceFrom) {
        updates.priceFrom = roundToPsychologicalPrice(product.priceFrom);
      }
      
      if (product.priceTo) {
        updates.priceTo = roundToPsychologicalPrice(product.priceTo);
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
      
      console.log(`${product.name}:`);
      console.log(`  Pris: ${product.price / 100} kr → ${updates.price / 100} kr`);
      if (product.priceFrom && product.priceTo) {
        console.log(`  Range: ${product.priceFrom / 100} - ${product.priceTo / 100} kr → ${updates.priceFrom / 100} - ${updates.priceTo / 100} kr`);
      }
      console.log('');
    }
    
    console.log('✓ Alle priser oppdatert!');
  } catch (error) {
    console.error('Feil ved oppdatering av priser:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrices();
