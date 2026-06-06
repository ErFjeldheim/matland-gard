import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStockUnits() {
  try {
    // Oppdater produkter basert på navn
    await prisma.product.updateMany({
      where: { name: { in: ['Herregårdssingel', 'Kirkegårdssingel'] } },
      data: { stockUnit: 'storsekk' },
    });

    await prisma.product.updateMany({
      where: { name: { in: ['Grus', 'Elvestein', 'Sand'] } },
      data: { stockUnit: 'tonn' },
    });

    await prisma.product.updateMany({
      where: { name: 'Singelmatter ECCOgravel' },
      data: { stockUnit: 'stk.' },
    });

    console.log('Updated stock units for all products');
  } catch (error) {
    console.error('Error updating stock units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStockUnits();
