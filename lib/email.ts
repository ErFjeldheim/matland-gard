import nodemailer from 'nodemailer';

// Create transporter function to ensure env vars are loaded
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('MISSING EMAIL CONFIG: EMAIL_USER or EMAIL_PASSWORD not set');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string | null;
  totalAmount: number;
  status: string;
  shippingMethod: string | null;
  orderItems: Array<{
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
}

// Send order confirmation email to customer
export async function sendCustomerOrderConfirmation(orderData: OrderEmailData) {
  if (!orderData.customerEmail) {
    console.error('Cannot send email: No customer email provided');
    return;
  }

  const shortOrderId = (orderData.orderId || 'UNKNOWN').slice(0, 8).toUpperCase();

  const itemsList = (orderData.orderItems || [])
    .map(
      (item) =>
        `- ${item.product?.name || 'Produkt'}: ${item.quantity} stk × ${item.price / 100} NOK = ${(item.quantity * item.price) / 100} NOK`
    )
    .join('\n');

  const itemsTotal = (orderData.orderItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = orderData.totalAmount - itemsTotal;

  let shippingText = 'Ikkje spesifisert';

  if (orderData.shippingMethod === 'pickup') {
    shippingText = 'Henting på staden';
  } else if (orderData.shippingMethod === 'shipping_quote') {
    shippingText = 'Vi kontaktar deg med tilbod på frakt';
  } else {
    let methodName = 'Frakt';
    if (orderData.shippingMethod === 'shipping_fixed_1000') methodName = 'Fastpris frakt (Sone 1)';
    if (orderData.shippingMethod === 'shipping_fixed_1500') methodName = 'Fastpris frakt (Sone 2)';

    // Check if we have a valid calculated shipping cost that is greater than 0
    if (shippingCost > 0) {
      shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    } else {
      // Fallback if calculation yields 0 or negative (shouldn't happen for fixed shipping but good for safety)
      // or if it really is free shipping
      if (orderData.shippingMethod === 'shipping_fixed_1000') shippingText = 'Fastpris frakt (Sone 1): 1000 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1500') shippingText = 'Fastpris frakt (Sone 2): 1500 NOK';
      else shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    }
  }

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

// Send order notification to Matland Gård
export async function sendAdminOrderNotification(orderData: OrderEmailData) {
  const shortOrderId = (orderData.orderId || 'UNKNOWN').slice(0, 8).toUpperCase();

  const itemsList = (orderData.orderItems || [])
    .map(
      (item) =>
        `- ${item.product?.name || 'Produkt'}: ${item.quantity} stk × ${item.price / 100} NOK = ${(item.quantity * item.price) / 100} NOK`
    )
    .join('\n');

  const itemsTotal = (orderData.orderItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = orderData.totalAmount - itemsTotal;

  let shippingText = 'Ikkje spesifisert';

  if (orderData.shippingMethod === 'pickup') {
    shippingText = 'Henting på staden';
  } else if (orderData.shippingMethod === 'shipping_quote') {
    shippingText = 'Tilbod på frakt må sendast';
  } else {
    let methodName = 'Frakt';
    if (orderData.shippingMethod === 'shipping_fixed_1000') methodName = 'Fastpris frakt (Sone 1)';
    if (orderData.shippingMethod === 'shipping_fixed_1500') methodName = 'Fastpris frakt (Sone 2)';

    if (shippingCost > 0) {
      shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    } else {
      if (orderData.shippingMethod === 'shipping_fixed_1000') shippingText = 'Fastpris frakt (Sone 1): 1000 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1500') shippingText = 'Fastpris frakt (Sone 2): 1500 NOK';
      else shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    }
  }

  const brandPrimary = '#1D546D';
  const brandBackground = '#F3F4F4';

  const mailOptions = {
    from: `"Matland Gård System" <${process.env.EMAIL_USER || 'matlandgard@gmail.com'}>`,
    to: process.env.EMAIL_USER || 'matlandgard@gmail.com',
    subject: `Ny ordre motteken - ${shortOrderId}`,
    text: `
NY ORDRE MOTTEKEN

Ordrenummer: ${shortOrderId}
Status: ${orderData.status}

Kundeinformasjon:
Navn: ${orderData.customerName}
E-post: ${orderData.customerEmail}
Telefon: ${orderData.customerPhone}

Bestilte produkt:
${itemsList}

Totalt: ${orderData.totalAmount / 100} NOK

Leveringsmetode: ${shippingText}
${orderData.deliveryAddress ? `Leveringsadresse: ${orderData.deliveryAddress}` : ''}

Behandle ordren i admin-panelet.
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #061E29; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #061E29; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🔔 NY ORDRE MOTTEKEN</h2>
        </div>
        
        <div style="padding: 25px;">
          <div style="background-color: ${brandBackground}; padding: 15px; margin-bottom: 25px; border-radius: 5px; border: 1px solid #ddd;">
            <table style="width: 100%;">
              <tr>
                <td>
                  <strong style="display: block; font-size: 11px; color: #666; text-transform: uppercase;">Ordrenummer</strong>
                  <span style="font-size: 18px; font-weight: bold; font-family: monospace;">${shortOrderId}</span>
                </td>
                <td style="text-align: right;">
                  <strong style="display: block; font-size: 11px; color: #666; text-transform: uppercase;">Status</strong>
                  <span style="font-size: 14px; font-weight: bold; color: ${orderData.status === 'paid' ? '#2E7D32' : brandPrimary}; border: 1px solid ${orderData.status === 'paid' ? '#C8E6C9' : brandPrimary}; padding: 2px 8px; border-radius: 3px; background: ${orderData.status === 'paid' ? '#E8F5E9' : 'transparent'};">
                    ${orderData.status === 'paid' ? 'BETALT' : 'IKKJE BETALT'}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <h3 style="color: ${brandPrimary}; border-bottom: 2px solid ${brandPrimary}; padding-bottom: 5px; margin-top: 0;">Kundeinformasjon</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;">Navn:</td>
              <td style="padding: 8px 0; font-weight: bold;">${orderData.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">E-post:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${orderData.customerEmail}" style="color: ${brandPrimary}; text-decoration: none;">${orderData.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Telefon:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="tel:${orderData.customerPhone}" style="color: ${brandPrimary}; text-decoration: none;">${orderData.customerPhone}</a></td>
            </tr>
          </table>

          <h3 style="color: ${brandPrimary}; border-bottom: 2px solid ${brandPrimary}; padding-bottom: 5px;">Bestilte produkt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${(orderData.orderItems || [])
        .map(
          (item) =>
            `<tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0;">
                    <strong style="color: #061E29; display: block;">${item.product?.name || 'Produkt'}</strong>
                    <span style="font-size: 13px; color: #666;">${item.quantity} stk × ${item.price / 100} NOK</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">
                    ${(item.quantity * item.price) / 100} NOK
                  </td>
                </tr>`
        )
        .join('')}
          </table>

          <div style="background-color: ${brandPrimary}; color: white; padding: 15px; margin: 25px 0; border-radius: 5px;">
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: middle; font-size: 18px; font-weight: bold;">Totalbeløp</td>
                <td style="text-align: right; vertical-align: middle; font-size: 24px; font-weight: bold;">${orderData.totalAmount / 100} NOK</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong>Leveringsmetode:</strong> ${shippingText}</p>
            ${orderData.deliveryAddress ? `<p style="margin: 0;"><strong>Leveringsadresse:</strong> ${orderData.deliveryAddress}</p>` : ''}
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 0 5px 5px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ Handling påkrevd:</p>
            <p style="margin: 5px 0 0 0; color: #856404;">Logg inn i admin-panelet for å behandle ordren.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const transporter = getTransporter();
    console.log(`Attempting to send admin notification for order ${shortOrderId}...`);
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('FAILED to send admin notification email:', error);
  }
}
