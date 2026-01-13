
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking settings...');
    const keys = ['hero_text', 'hero_image_url', 'contact_phone', 'contact_address'];

    for (const key of keys) {
        const s = await prisma.setting.findUnique({ where: { key } });
        console.log(`Key ${key}: ${s ? 'FOUND' : 'MISSING'}`);
        if (s) console.log('Value:', s.value);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
