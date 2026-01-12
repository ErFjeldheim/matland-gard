import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStock() {
  try {
    const result = await prisma.product.updateMany({
      data: { stock: 1000 },
    });
    console.log(`✅ Updated ${result.count} products with stock: 1000`);
  } catch (error) {
    console.error('❌ Error updating stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStock();
