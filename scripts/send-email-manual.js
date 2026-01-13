
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
try { require('dotenv').config(); } catch (e) { console.log('dotenv not found or error'); }

const prisma = new PrismaClient();

function getTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('MISSING EMAIL CONFIG: EMAIL_USER or EMAIL_PASSWORD not set');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
    });
}

// Copied and adapted from lib/email.ts (latest version)
async function sendCustomerOrderConfirmation(orderData) {
    if (!orderData.customerEmail) {
        console.error('Cannot send email: No customer email provided');
        return;
    }

    const shortOrderId = (orderData.orderId || 'UNKNOWN').slice(0, 8).toUpperCase();

    // Plain text list (legacy/fallback)
    const itemsList = (orderData.orderItems || [])
        .map(
            (item) =>
                `- ${item.product?.name || 'Produkt'}: ${item.quantity} stk × ${item.price / 100} NOK = ${(item.quantity * item.price) / 100} NOK`
        )
        .join('\n');

    const shippingText = orderData.shippingMethod === 'pickup'
        ? 'Henting på staden'
        : orderData.shippingMethod === 'shipping_fixed_1000'
            ? 'Fastpris frakt (Sone 1): 1000 NOK'
            : orderData.shippingMethod === 'shipping_fixed_1500'
                ? 'Fastpris frakt (Sone 2): 1500 NOK'
                : orderData.shippingMethod === 'shipping_quote'
                    ? 'Vi kontaktar deg med tilbod på frakt'
                    : 'Ikkje spesifisert';

    const isPaid = orderData.status === 'paid' || orderData.status === 'delivered';
    const totalText = isPaid ? 'Totalbeløp (betalt)' : 'Totalt å betale';
    const brandPrimary = '#1D546D';
    const brandBackground = '#F3F4F4';

    const mailOptions = {
        from: `"Matland Gård" <${process.env.EMAIL_USER || 'matlandgard@gmail.com'}>`,
        to: orderData.customerEmail,
        subject: `Ordrestadfesting - ${shortOrderId}`,
        text: `
Hei ${orderData.customerName},

Takk for di bestilling hjå Matland Gård!

Ordrenummer: ${shortOrderId}

Bestilte produkt:
${itemsList}

${totalText}: ${orderData.totalAmount / 100} NOK

Leveringsmetode: ${shippingText}
${orderData.deliveryAddress ? `Leveringsadresse: ${orderData.deliveryAddress}` : ''}

Vi behandlar ordren din og vil kontakte deg snart med meir informasjon.

Med venleg helsing,
Matland Gård
Telefon: +47 954 58 563
    `,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #061E29; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${brandPrimary}; color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Matland Gård</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ordrestadfesting</p>
        </div>
        
        <div style="padding: 25px;">
          <p>Hei ${orderData.customerName},</p>
          <p>Takk for di bestilling hjå Matland Gård!</p>
          
          <div style="background-color: ${brandBackground}; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${brandPrimary};">
            <strong style="color: ${brandPrimary}; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 5px;">Ordrenummer</strong>
            <span style="font-size: 18px; font-weight: bold; font-family: monospace;">${shortOrderId}</span>
          </div>

          <h3 style="color: ${brandPrimary}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Bestilte produkt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${(orderData.orderItems || [])
                .map(
                    (item) =>
                        `<tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0;">
                    <strong style="color: #061E29; display: block;">${item.product?.name || 'Produkt'}</strong>
                    <span style="font-size: 13px; color: #666;">${item.quantity} stk × ${item.price / 100} NOK</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right; vertical-align: top; font-weight: bold; color: ${brandPrimary}; white-space: nowrap;">
                    ${(item.quantity * item.price) / 100} NOK
                  </td>
                </tr>`
                )
                .join('')}
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
            <tr>
              <td style="background-color: ${isPaid ? '#E8F5E9' : brandPrimary}; color: ${isPaid ? '#2E7D32' : 'white'}; padding: 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 14px; text-transform: uppercase; opacity: 0.9; margin-bottom: 5px;">${totalText}</div>
                <div style="font-size: 28px; font-weight: bold;">${orderData.totalAmount / 100} NOK</div>
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #eee; border-radius: 5px;">
            <tr>
              <td style="padding: 15px;">
                <p style="margin: 0 0 10px 0;"><strong style="color: ${brandPrimary};">Leveringsmetode:</strong><br/>${shippingText}</p>
                ${orderData.deliveryAddress ? `<p style="margin: 0;"><strong style="color: ${brandPrimary};">Leveringsadresse:</strong><br/>${orderData.deliveryAddress}</p>` : ''}
              </td>
            </tr>
          </table>

          <p style="margin-top: 30px; line-height: 1.5;">Vi behandlar ordren din og vil kontakte deg snart med meir informasjon.</p>

          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Med venleg helsing,<br/>
            <strong style="color: ${brandPrimary};">Matland Gård</strong><br/>
            Ådlandsvegen 30, 5642 Holmefjord<br/>
            Telefon: +47 954 58 563</p>
          </div>
        </div>
      </div>
    `,
    };

    try {
        const transporter = getTransporter();
        console.log(`Attempting to send customer confirmation email to ${orderData.customerEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent successfully: ${info.messageId}`);
    } catch (error) {
        console.error(`FAILED to send customer confirmation email to ${orderData.customerEmail}:`, error);
    }
}

async function processOrder(order) {
    const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true }
    });

    const orderData = {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: 'erik@fjelldata.com', // Override recipient
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount, // Ensure this exists on the passed object
        status: order.status, // Ensure this exists on the passed object
        shippingMethod: order.shippingMethod, // Ensure this exists on the passed object
        orderItems: orderItems
    };

    await sendCustomerOrderConfirmation(orderData);
}

async function main() {
    console.log('Using script to send email...');

    // Look for ID containing the fragment, but treat it as case-insensitive if possible or use lowercase
    // The previous debug showed ID: 1d835383...
    const orderIdFragment = '1d835383';
    const orders = await prisma.order.findMany({
        where: { id: { contains: orderIdFragment } }
    });

    if (orders.length === 0) {
        console.error(`Order containing ${orderIdFragment} not found.`);

        // Debug: List last 1 order FULLly
        const lastOrders = await prisma.order.findMany({
            take: 1,
            orderBy: { createdAt: 'desc' },
        });

        if (lastOrders.length > 0) {
            console.log(`Fallback: Using most recent order ${lastOrders[0].id} for testing.`);
            const order = lastOrders[0];
            await processOrder(order);
            return;
        }
        return;
    }

    const order = orders[0];
    console.log(`Found order: ${order.id}`);
    await processOrder(order);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
