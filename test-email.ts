import { config } from 'dotenv';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from './lib/email';

// Load environment variables
config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0);
console.log('');

// Verify connection first
async function verifyConnection() {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  try {
    console.log('Tester SMTP-tilkobling...');
    await transporter.verify();
    console.log('SMTP-tilkobling OK!\n');
    return true;
  } catch (error) {
    console.error('SMTP-tilkobling feilet:', error);
    return false;
  }
}

// Test order data
const testOrder = {
  orderId: 'TEST-' + Date.now(),
  customerName: 'Erik Test',
  customerEmail: 'matlandgard@gmail.com', // Sending to yourself for testing
  customerPhone: '+47 954 58 563',
  deliveryAddress: 'Testveien 123, 1234 Testby',
  totalAmount: 250000, // 2500 NOK in øre
  shippingMethod: 'shipping_quote',
  orderItems: [
    {
      product: {
        name: 'Herregårdssingel 11-16mm',
      },
      quantity: 2,
      price: 100000, // 1000 NOK
    },
    {
      product: {
        name: 'Elvestein 30-60mm',
      },
      quantity: 1,
      price: 50000, // 500 NOK
    },
  ],
};

async function testEmails() {
  try {
    // First verify connection
    const connected = await verifyConnection();
    if (!connected) {
      console.log('\nKan ikke fortsette uten gyldig SMTP-tilkobling.');
      console.log('\nSjekkliste:');
      console.log('1. Er 2-trinns verifisering aktivert på Gmail-kontoen?');
      console.log('2. Er app-passordet generert fra https://myaccount.google.com/apppasswords?');
      console.log('3. Er app-passordet skrevet inn riktig (16 tegn uten mellomrom)?');
      return;
    }

    console.log('Sender test e-poster...\n');
    
    console.log('1. Sender kundebekreftelse...');
    await sendCustomerOrderConfirmation(testOrder as any);
    console.log('Kundebekreftelse sendt!\n');
    
    console.log('2. Sender admin-varsel...');
    await sendAdminOrderNotification(testOrder as any);
    console.log('Admin-varsel sendt!\n');
    
    console.log('Test fullført! Sjekk matlandgard@gmail.com for å se e-postene.');
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    if (error instanceof Error) {
      console.error('Feilmelding:', error.message);
    }
  }
}

testEmails();
