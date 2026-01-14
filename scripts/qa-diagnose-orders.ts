import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    bold: "\x1b[1m"
};

async function diagnoseOrders() {
    console.log('🕵️ Diagnosing Recent Orders...\n');

    // Fetch last 15 orders
    const orders = await prisma.order.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: {
                include: { product: true }
            }
        }
    });

    if (orders.length === 0) {
        console.log('No orders found in database.');
        return;
    }

    console.log(`Analyzing last ${orders.length} orders:\n`);

    for (const order of orders) {
        const date = new Date(order.createdAt).toISOString().split('T')[0]; // simple date
        const amount = (order.totalAmount / 100).toFixed(0);
        const itemsCount = order.orderItems.length;

        let statusIcon = '❓';
        let statusColor = colors.reset;

        if (order.status === 'pending') { statusIcon = '⏳'; statusColor = colors.yellow; }
        else if (order.status === 'paid') { statusIcon = '💰'; statusColor = colors.green; }
        else if (order.status === 'delivered') { statusIcon = '🚚'; statusColor = colors.green; }
        else if (order.status === 'cancelled') { statusIcon = '❌'; statusColor = colors.red; }

        console.log(`${statusIcon} ${statusColor}[${order.status.toUpperCase()}]${colors.reset} Order ${colors.bold}${order.id.slice(0, 8)}...${colors.reset} (${date}) - ${amount} kr`);

        // DIAGNOSTICS
        const issues = [];

        // 1. Check if paid but no paymentId (unless vipps? logic check needed)
        if ((order.status === 'paid' || order.status === 'processing') && !order.paymentId) {
            // If method is stripe, it SHOULD have a paymentId (session id). Vipps might verify differently, but usually has transaction ID.
            issues.push(`Paid status but missing paymentId/transactionId.`);
        }

        // 2. Check items
        if (itemsCount === 0) {
            issues.push(`Order has 0 items.`);
        }

        // 3. Check customer email validity (basic)
        if (!order.customerEmail.includes('@')) {
            issues.push(`Invalid customer email: ${order.customerEmail}`);
        }

        if (issues.length > 0) {
            issues.forEach(i => console.log(`   ${colors.red}⚠️ Issue: ${i}${colors.reset}`));
        } else {
            // console.log(`   ${colors.green}✓ OK${colors.reset}`);
        }
    }

    console.log('\n📊 Summary:');
    const pending = orders.filter(o => o.status === 'pending').length;
    const success = orders.filter(o => ['paid', 'processing', 'delivered'].includes(o.status)).length;

    console.log(`   Pending: ${pending}`);
    console.log(`   Paid/Processed: ${success}`);

}

diagnoseOrders()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
