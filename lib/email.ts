import nodemailer from 'nodemailer';
import { getShippingMethodLabel } from '@/lib/shipping';

export function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adminStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'BETALT';
    case 'requested':
      return 'FORESPURNAD – RESERVERT, IKKJE TRUKKE';
    case 'approved':
      return 'GODKJENT – IKKJE TRUKKE ENNÅ';
    default:
      return 'IKKJE BETALT';
  }
}

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
  orderId?: string;
  id?: string; // Support prisma objects directly
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

  const shortOrderId = (orderData.orderId || orderData.id || 'UNKNOWN').slice(0, 8).toUpperCase();

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
    const methodName = getShippingMethodLabel(orderData.shippingMethod);

    // Check if we have a valid calculated shipping cost that is greater than 0
    if (shippingCost > 0) {
      shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    } else {
      // Fallback if calculation yields 0 or negative (shouldn't happen for fixed shipping but good for safety)
      // or if it really is free shipping
      if (orderData.shippingMethod === 'shipping_fixed') shippingText = 'Fastpris frakt (heile landet): 1500 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1250') shippingText = 'Fastpris frakt (Sone 1): 1250 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1875') shippingText = 'Fastpris frakt (Sone 2): 1875 NOK';
      else if (orderData.shippingMethod === 'pickup_dokken') shippingText = 'Henting Skur 25 Møhlenpriskaien 8: 125 NOK';
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
          <p>Hei ${escapeHtml(orderData.customerName)},</p>
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
                ${orderData.deliveryAddress ? `<p style="margin: 0;"><strong style="color: ${brandPrimary};">Leveringsadresse:</strong><br/>${escapeHtml(orderData.deliveryAddress)}</p>` : ''}
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
  const shortOrderId = (orderData.orderId || orderData.id || 'UNKNOWN').slice(0, 8).toUpperCase();

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
    const methodName = getShippingMethodLabel(orderData.shippingMethod);

    if (shippingCost > 0) {
      shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    } else {
      if (orderData.shippingMethod === 'shipping_fixed') shippingText = 'Fastpris frakt (heile landet): 1500 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1250') shippingText = 'Fastpris frakt (Sone 1): 1250 NOK';
      else if (orderData.shippingMethod === 'shipping_fixed_1875') shippingText = 'Fastpris frakt (Sone 2): 1875 NOK';
      else if (orderData.shippingMethod === 'pickup_dokken') shippingText = 'Henting Skur 25 Møhlenpriskaien 8: 125 NOK';
      else shippingText = `${methodName}: ${shippingCost / 100} NOK`;
    }
  }

  const brandPrimary = '#1D546D';
  const brandBackground = '#F3F4F4';
  const isRequest = orderData.status === 'requested';

  const mailOptions = {
    from: `"Matland Gård System" <${process.env.EMAIL_USER || 'matlandgard@gmail.com'}>`,
    to: process.env.EMAIL_USER || 'matlandgard@gmail.com',
    subject: `${isRequest ? 'Ny forespurnad motteken' : 'Ny ordre motteken'} - ${shortOrderId}`,
    text: `
${isRequest ? 'NY FORESPURNAD MOTTEKEN' : 'NY ORDRE MOTTEKEN'}

Ordrenummer: ${shortOrderId}
Status: ${adminStatusLabel(orderData.status)}

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
          <h2 style="margin: 0;">${isRequest ? 'NY FORESPURNAD MOTTEKEN' : 'NY ORDRE MOTTEKEN'}</h2>
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
                    ${adminStatusLabel(orderData.status)}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <h3 style="color: ${brandPrimary}; border-bottom: 2px solid ${brandPrimary}; padding-bottom: 5px; margin-top: 0;">Kundeinformasjon</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;">Navn:</td>
              <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(orderData.customerName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">E-post:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${escapeHtml(orderData.customerEmail)}" style="color: ${brandPrimary}; text-decoration: none;">${escapeHtml(orderData.customerEmail)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Telefon:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="tel:${escapeHtml(orderData.customerPhone)}" style="color: ${brandPrimary}; text-decoration: none;">${escapeHtml(orderData.customerPhone)}</a></td>
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
            ${orderData.deliveryAddress ? `<p style="margin: 0;"><strong>Leveringsadresse:</strong> ${escapeHtml(orderData.deliveryAddress)}</p>` : ''}
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 0 5px 5px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">Handling påkrevd:</p>
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
// Send refund notification email to customer and admin
export async function sendRefundNotification(orderData: OrderEmailData) {
  if (!orderData.customerEmail) {
    console.error('Cannot send refund email: No customer email provided');
    return;
  }

  const shortOrderId = (orderData.orderId || orderData.id || 'UNKNOWN').slice(0, 8).toUpperCase();
  const brandPrimary = '#1D546D';
  const brandBackground = '#F3F4F4';

  const mailOptions = {
    from: `"Matland Gård" <${process.env.EMAIL_USER || 'matlandgard@gmail.com'}>`,
    to: `${orderData.customerEmail}, ${process.env.EMAIL_USER || 'matlandgard@gmail.com'}`,
    subject: `Ordre refundert - ${shortOrderId}`,
    text: `
Hei ${orderData.customerName},

Vi har no refundert di bestilling hjå Matland Gård.

Ordrenummer: ${shortOrderId}
Beløp refundert: ${orderData.totalAmount / 100} NOK

Pengane vil vere på konto i løpet av nokre virkedagar, avhengig av betalingsmetode.

Med venleg helsing,
Matland Gård
Telefon: +47 954 58 563
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #061E29; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6C757D; color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Matland Gård</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ordre refundert</p>
        </div>
        
        <div style="padding: 25px;">
          <p>Hei ${escapeHtml(orderData.customerName)},</p>
          <p>Vi har no refundert di bestilling hjå Matland Gård.</p>
          
          <div style="background-color: ${brandBackground}; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #6C757D;">
            <strong style="color: #6C757D; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 5px;">Ordrenummer</strong>
            <span style="font-size: 18px; font-weight: bold; font-family: monospace;">${shortOrderId}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
            <tr>
              <td style="background-color: #F8F9FA; color: #6C757D; padding: 20px; border-radius: 5px; text-align: center; border: 1px solid #ddd;">
                <div style="font-size: 14px; text-transform: uppercase; opacity: 0.9; margin-bottom: 5px;">Beløp refundert</div>
                <div style="font-size: 28px; font-weight: bold;">${orderData.totalAmount / 100} NOK</div>
              </td>
            </tr>
          </table>

          <p style="margin-top: 30px; line-height: 1.5;">Pengane vil vere på konto i løpet av nokre virkedagar, avhengig av betalingsmetode.</p>

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
    console.log(`Attempting to send refund notification email to ${orderData.customerEmail} and admin...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Refund notification email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`FAILED to send refund notification email:`, error);
  }
}

type CustomerStatusEmail = {
  subject: string;
  heading: string;
  intro: string;
  notice: string;
  tone: 'info' | 'success' | 'warning';
};

const NOTICE_STYLES = {
  info: { background: '#E3F2FD', border: '#1D546D', text: '#0D47A1' },
  success: { background: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' },
  warning: { background: '#FFF3E0', border: '#EF6C00', text: '#8D4E00' },
} as const;

async function sendCustomerStatusEmail(orderData: OrderEmailData, email: CustomerStatusEmail) {
  if (!orderData.customerEmail) {
    console.error('Cannot send email: No customer email provided');
    return;
  }

  const shortOrderId = (orderData.orderId || orderData.id || 'UNKNOWN').slice(0, 8).toUpperCase();
  const brandPrimary = '#1D546D';
  const brandBackground = '#F3F4F4';
  const tone = NOTICE_STYLES[email.tone];
  const totalText = `${orderData.totalAmount / 100} NOK`;

  const mailOptions = {
    from: `"Matland Gård" <${process.env.EMAIL_USER || 'matlandgard@gmail.com'}>`,
    to: orderData.customerEmail,
    subject: `${email.subject} - ${shortOrderId}`,
    text: `
Hei ${orderData.customerName},

${email.intro}

Ordrenummer: ${shortOrderId}
Totalbeløp: ${totalText}

${email.notice}

Med venleg helsing,
Matland Gård
Telefon: +47 954 58 563
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #061E29; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${brandPrimary}; color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Matland Gård</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${escapeHtml(email.heading)}</p>
        </div>

        <div style="padding: 25px;">
          <p>Hei ${escapeHtml(orderData.customerName)},</p>
          <p style="line-height: 1.5;">${escapeHtml(email.intro)}</p>

          <div style="background-color: ${brandBackground}; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${brandPrimary};">
            <strong style="color: ${brandPrimary}; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 5px;">Ordrenummer</strong>
            <span style="font-size: 18px; font-weight: bold; font-family: monospace;">${shortOrderId}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
            <tr>
              <td style="background-color: ${brandPrimary}; color: white; padding: 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 14px; text-transform: uppercase; opacity: 0.9; margin-bottom: 5px;">Totalbeløp</div>
                <div style="font-size: 28px; font-weight: bold;">${totalText}</div>
              </td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; border-radius: 5px; background-color: ${tone.background}; border-left: 4px solid ${tone.border}; color: ${tone.text}; line-height: 1.5;">
            ${escapeHtml(email.notice)}
          </div>

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
    console.log(`Attempting to send "${email.subject}" to ${orderData.customerEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Customer status email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`FAILED to send customer status email to ${orderData.customerEmail}:`, error);
  }
}

export async function sendCustomerRequestReceived(orderData: OrderEmailData) {
  return sendCustomerStatusEmail(orderData, {
    subject: 'Forespurnad mottatt',
    heading: 'Forespurnad mottatt',
    intro: 'Takk for forespurnaden din hjå Matland Gård. Vi går gjennom ho og tek kontakt med deg for å stadfeste bestillinga.',
    notice: 'Beløpet er reservert på betalingsmetoden din, men det blir ikkje trekt før varen er sendt. Forespurnaden er ikkje bindande før vi har stadfesta ho.',
    tone: 'info',
  });
}

export async function sendCustomerRequestApproved(orderData: OrderEmailData) {
  return sendCustomerStatusEmail(orderData, {
    subject: 'Forespurnaden din er godkjent',
    heading: 'Forespurnaden din er godkjent',
    intro: 'Vi har godkjent bestillinga di. Beløpet blir trekt når varen er sendt, og vi tek kontakt med deg om levering eller henting.',
    notice: 'Du treng ikkje gjere noko.',
    tone: 'success',
  });
}

export async function sendCustomerRequestDeclined(orderData: OrderEmailData) {
  return sendCustomerStatusEmail(orderData, {
    subject: 'Vi kan ikkje ta imot forespurnaden din',
    heading: 'Forespurnaden din er ikkje godkjent',
    intro: 'Dessverre kan vi ikkje gjennomføre bestillinga di. Reservasjonen er frigitt, og beløpet blir ikkje trekt.',
    notice: 'Har du spørsmål, kan du ringe oss på +47 954 58 563 eller sende e-post til matlandgard@gmail.com.',
    tone: 'warning',
  });
}

export async function sendCustomerCaptureReceipt(orderData: OrderEmailData) {
  return sendCustomerStatusEmail(orderData, {
    subject: 'Beløpet er trekt',
    heading: 'Beløpet er trekt',
    intro: 'Varen er sendt, og beløpet for bestillinga di er trekt. Takk for handelen!',
    notice: 'Ta kontakt med oss dersom noko ikkje stemmer.',
    tone: 'success',
  });
}
