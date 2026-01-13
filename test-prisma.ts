import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const products = await prisma.product.findMany({
            where: {
                stock: { gt: 0 },
                isActive: true,
            },
        });
        console.log('Successfully fetched products:', products.length);
    } catch (error) {
        console.error('Prisma Error:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
