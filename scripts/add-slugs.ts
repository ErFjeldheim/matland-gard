import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🔧 Adding slugs to existing products...');

    // Define slug mappings for existing products
    const slugMappings = [
        { name: 'Herregårdssingel', slug: 'herregardssingel' },
        { name: 'Grus', slug: 'grus' },
        { name: 'Elvestein', slug: 'elvestein' },
        { name: 'Sand', slug: 'sand' },
        { name: 'Kirkegårdssingel', slug: 'kirkegardssingel' },
        { name: 'Singelmatter ECCOgravel', slug: 'singelmatter-eccogravel' },
    ];

    for (const mapping of slugMappings) {
        const updated = await prisma.product.updateMany({
            where: { name: mapping.name },
            data: { slug: mapping.slug },
        });
        if (updated.count > 0) {
            console.log(`✅ Updated ${mapping.name} with slug: ${mapping.slug}`);
        }
    }

    console.log('🎉 All products updated with slugs!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
