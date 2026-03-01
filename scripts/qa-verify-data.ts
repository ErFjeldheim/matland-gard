import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const pass = (msg: string) => console.log(`${colors.green}[PASS] ${msg}${colors.reset}`);
const fail = (msg: string) => console.log(`${colors.red}[FAIL] ${msg}${colors.reset}`);
const warn = (msg: string) => console.log(`${colors.yellow}[WARN] ${msg}${colors.reset}`);

async function verifyData() {
    console.log('Verifying Data Integrity...\n');
    let errorCount = 0;

    // 1. Check Products
    console.log('Checking Active Products...');
    const products = await prisma.product.findMany({
        where: { isActive: true }
    });

    if (products.length === 0) {
        warn('No active products found.');
    } else {
        pass(`Found ${products.length} active products.`);
        for (const p of products) {
            if (p.price <= 0) {
                fail(`Product '${p.name}' (${p.id}) has invalid price: ${p.price}`);
                errorCount++;
            }
            if (!p.slug) {
                fail(`Product '${p.name}' (${p.id}) is missing slug`);
                errorCount++;
            }
        }
    }
    console.log('');

    // 2. Check Settings (Shipping Costs)
    // These keys are used in checkout/stripe/route.ts
    const requiredSettings = [
        'herregardssingel_price_4-8mm',
        'herregardssingel_price_8-16mm',
        'herregardssingel_price_16-32mm',
        'grus_price_0-16mm',
        'grus_price_0-32mm',
        'shipping_fixed_1000',
        'shipping_fixed_1500'
    ];

    console.log('Checking System Settings...');
    const settings = await prisma.setting.findMany({
        where: { key: { in: requiredSettings } }
    });

    const foundKeys = new Set(settings.map(s => s.key));

    for (const key of requiredSettings) {
        if (!foundKeys.has(key)) {
            fail(`Missing setting: ${key} (Checkout may fail or use default fallback)`);
            errorCount++;
        } else {
            pass(`Found setting: ${key}`);
        }
    }

    console.log('\n');
    if (errorCount > 0) {
        console.log(`${colors.red}Data verification FAILED with ${errorCount} errors.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.green}Data verification PASSED.${colors.reset}`);
    }
}

verifyData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
