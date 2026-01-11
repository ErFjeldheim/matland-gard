import nodemailer from 'nodemailer';

// Create transporter function to ensure env vars are loaded
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string | null;
  totalAmount: number;
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
  const itemsList = orderData.orderItems
    .map(
      (item) =>
        `- ${item.product.name}: ${item.quantity} stk × ${item.price} NOK = ${item.quantity * item.price} NOK`
    )
    .join('\n');

  const shippingText = orderData.shippingMethod === 'pickup' 
    ? 'Henting på stedet' 
    : orderData.shippingMethod === 'shipping_quote'
    ? 'Vi kontakter deg med frakttilbud'
    : 'Ikke spesifisert';

  const mailOptions = {
    from: `Matland Gård <${process.env.EMAIL_USER}>`,
    to: orderData.customerEmail,
    subject: `Ordrebekreftelse - ${orderData.orderId}`,
    text: `
Hei ${orderData.customerName},

Takk for din bestilling hos Matland Gård!

Ordrenummer: ${orderData.orderId}

Bestilte produkter:
${itemsList}

Totalt: ${orderData.totalAmount} NOK

Leveringsmetode: ${shippingText}
${orderData.deliveryAddress ? `Leveringsadresse: ${orderData.deliveryAddress}` : ''}

Vi behandler din ordre og vil kontakte deg snart med ytterligere informasjon.

Med vennlig hilsen,
Matland Gård
Telefon: ${orderData.customerPhone}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Ordrebekreftelse</h2>
        <p>Hei ${orderData.customerName},</p>
        <p>Takk for din bestilling hos Matland Gård!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Ordrenummer:</strong> ${orderData.orderId}
        </div>

        <h3 style="color: #2d5016;">Bestilte produkter:</h3>
        <ul style="list-style: none; padding: 0;">
          ${orderData.orderItems
            .map(
              (item) =>
                `<li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <strong>${item.product.name}</strong><br/>
                  ${item.quantity} stk × ${item.price} NOK = ${item.quantity * item.price} NOK
                </li>`
            )
            .join('')}
        </ul>

        <div style="background-color: #2d5016; color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Totalt: ${orderData.totalAmount} NOK</strong>
        </div>

        <p><strong>Leveringsmetode:</strong> ${shippingText}</p>
        ${orderData.deliveryAddress ? `<p><strong>Leveringsadresse:</strong> ${orderData.deliveryAddress}</p>` : ''}

        <p style="margin-top: 30px;">Vi behandler din ordre og vil kontakte deg snart med ytterligere informasjon.</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666;">
          <p>Med vennlig hilsen,<br/>
          <strong>Matland Gård</strong></p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${orderData.customerEmail}`);
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    throw error;
  }
}

// Send order notification to Matland Gård
export async function sendAdminOrderNotification(orderData: OrderEmailData) {
  const itemsList = orderData.orderItems
    .map(
      (item) =>
        `- ${item.product.name}: ${item.quantity} stk × ${item.price} NOK = ${item.quantity * item.price} NOK`
    )
    .join('\n');

  const shippingText = orderData.shippingMethod === 'pickup' 
    ? 'Henting på stedet' 
    : orderData.shippingMethod === 'shipping_quote'
    ? 'Frakttilbud må sendes'
    : 'Ikke spesifisert';

  const mailOptions = {
    from: `Matland Gård <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // matlandgard@gmail.com
    subject: `Ny ordre mottatt - ${orderData.orderId}`,
    text: `
NY ORDRE MOTTATT

Ordrenummer: ${orderData.orderId}

Kundeinformasjon:
Navn: ${orderData.customerName}
E-post: ${orderData.customerEmail}
Telefon: ${orderData.customerPhone}

Bestilte produkter:
${itemsList}

Totalt: ${orderData.totalAmount} NOK

Leveringsmetode: ${shippingText}
${orderData.deliveryAddress ? `Leveringsadresse: ${orderData.deliveryAddress}` : ''}

Logg inn i admin-panelet for å behandle ordren.
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016; background-color: #f0f8e8; padding: 15px; border-radius: 5px;">
          🔔 NY ORDRE MOTTATT
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Ordrenummer:</strong> ${orderData.orderId}
        </div>

        <h3 style="color: #2d5016;">Kundeinformasjon:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Navn:</strong> ${orderData.customerName}</li>
          <li><strong>E-post:</strong> ${orderData.customerEmail}</li>
          <li><strong>Telefon:</strong> ${orderData.customerPhone}</li>
        </ul>

        <h3 style="color: #2d5016;">Bestilte produkter:</h3>
        <ul style="list-style: none; padding: 0;">
          ${orderData.orderItems
            .map(
              (item) =>
                `<li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <strong>${item.product.name}</strong><br/>
                  ${item.quantity} stk × ${item.price} NOK = ${item.quantity * item.price} NOK
                </li>`
            )
            .join('')}
        </ul>

        <div style="background-color: #2d5016; color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Totalt: ${orderData.totalAmount} NOK</strong>
        </div>

        <p><strong>Leveringsmetode:</strong> ${shippingText}</p>
        ${orderData.deliveryAddress ? `<p><strong>Leveringsadresse:</strong> ${orderData.deliveryAddress}</p>` : ''}

        <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
          <p style="margin: 0;"><strong>⚠️ Handling påkrevd:</strong> Logg inn i admin-panelet for å behandle ordren.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Order notification email sent to admin');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
}
