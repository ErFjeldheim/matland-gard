import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStockUnits() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, stockUnit: true },
    });
    
    console.log('Current stock units in database:');
    products.forEach(p => {
      console.log(`${p.name}: ${p.stockUnit}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStockUnits();
