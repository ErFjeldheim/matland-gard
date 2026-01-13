
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateHtml(orderData) {
    const shortOrderId = (orderData.orderId || 'UNKNOWN').slice(0, 8).toUpperCase();
    const brandPrimary = '#1D546D';
    const brandBackground = '#F3F4F4';

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

    const html = ` 
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

          <div style="background-color: ${isPaid ? '#E8F5E9' : brandPrimary}; color: ${isPaid ? '#2E7D32' : 'white'}; padding: 20px; margin: 25px 0; border-radius: 5px; text-align: center;">
            <div style="font-size: 14px; text-transform: uppercase; opacity: 0.9; margin-bottom: 5px;">${totalText}</div>
            <div style="font-size: 28px; font-weight: bold;">${orderData.totalAmount / 100} NOK</div>
          </div>

          <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong style="color: ${brandPrimary};">Leveringsmetode:</strong><br/>${shippingText}</p>
            ${orderData.deliveryAddress ? `<p style="margin: 0;"><strong style="color: ${brandPrimary};">Leveringsadresse:</strong><br/>${orderData.deliveryAddress}</p>` : ''}
          </div>

          <p style="margin-top: 30px; line-height: 1.5;">Vi behandlar ordren din og vil kontakte deg snart med meir informasjon.</p>

          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Med venleg helsing,<br/>
            <strong style="color: ${brandPrimary};">Matland Gård</strong><br/>
            Ådlandsvegen 30, 5642 Holmefjord<br/>
            Telefon: +47 954 58 563</p>
          </div>
        </div>
      </div>
  `;
    return html;
}

async function main() {
    const orderId = '1d835383-cb93-413e-91fc-7c384a271caa';
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: { include: { product: true } } }
    });

    if (!order) {
        console.log('Order not found');
        return;
    }

    const orderData = {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        status: order.status,
        shippingMethod: order.shippingMethod,
        orderItems: order.orderItems
    };

    const html = await generateHtml(orderData);
    console.log(html);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
