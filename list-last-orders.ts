
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to Prisma...');
    try {
        const orders = await prisma.order.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        console.log('Orders fetched:', orders.length);

        console.log('Last 10 orders:');
        orders.forEach((order) => {
            console.log(`ID: ${order.id} | Short: ${order.id.slice(0, 8).toUpperCase()} | Customer: ${order.customerName} | Status: ${order.status}`);
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
