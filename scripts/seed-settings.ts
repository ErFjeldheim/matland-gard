import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seedar innstillingar...');

    const settings = [
        { key: 'herregardssingel_price_4-8mm', value: '1750', type: 'number' },
        { key: 'herregardssingel_price_8-16mm', value: '1500', type: 'number' },
        { key: 'herregardssingel_price_16-32mm', value: '1500', type: 'number' },
        { key: 'grus_price_0-16mm', value: '599', type: 'number' },
        { key: 'grus_price_0-32mm', value: '599', type: 'number' },
        { key: 'shipping_fixed_1000', value: '1000', type: 'number' },
        { key: 'shipping_fixed_1500', value: '1500', type: 'number' },
        { key: 'contact_email', value: 'matlandgard@gmail.com', type: 'text' },
        { key: 'hero_title', value: 'Velkomen til Matland Gård', type: 'text' },
        { key: 'season_text', value: 'April - Oktober', type: 'text' },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
        console.log(`✅ Innstilling oppretta/oppdatert: ${setting.key}`);
    }

    console.log('🎉 Seeding fullfør!');
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
