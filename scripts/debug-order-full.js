
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderId = '1d835383-cb93-413e-91fc-7c384a271caa';
    console.log(`Searching for order: ${orderId}`);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
    });

    if (!order) {
        console.log('Order not found');
    } else {
        console.log(JSON.stringify(order, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
