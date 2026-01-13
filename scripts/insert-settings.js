
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Inserting/Updating settings...');
    const settings = [
        { key: 'hero_title', value: 'Velkomen til Matland Gård', type: 'text' },
        { key: 'hero_text', value: 'Vi tilbyr steinprodukt av høgaste kvalitet, bobilparkering ved fjorden, og unike lokale til dine selskap.', type: 'text' },
        { key: 'hero_image_url', value: '/images/hero/gard-oversikt.jpg', type: 'text' },
        { key: 'contact_email', value: 'matlandgard@gmail.com', type: 'text' },
        { key: 'contact_phone', value: '+47 954 58 563', type: 'text' },
        { key: 'contact_address', value: 'Ådlandsvegen 30, 5642 Holmefjord', type: 'text' },
        { key: 'season_text', value: 'April - Oktober', type: 'text' },
        // Frakt
        { key: 'shipping_fixed_1000', value: '1000', type: 'number' },
        { key: 'shipping_fixed_1500', value: '1500', type: 'number' },
    ];

    for (const setting of settings) {
        const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
        if (!existing) {
            await prisma.setting.create({ data: setting });
            console.log(`✅ Created: ${setting.key}`);
        } else {
            console.log(`ℹ️  Exists: ${setting.key}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
