
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking prisma.setting...');
    try {
        if (!prisma.setting) {
            console.error('ERROR: prisma.setting is undefined!');
            if (!prisma.Setting) {
                console.error('ERROR: prisma.Setting (Capitalized) is also undefined!');
            } else {
                console.log('SUCCESS: prisma.Setting exists (Capitalized).');
            }
        } else {
            console.log('SUCCESS: prisma.setting exists.');
            const settings = await prisma.setting.findMany();
            console.log('Fetched settings:', settings);
        }
    } catch (e) {
        console.error('Error accessing prisma.setting:', e);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
