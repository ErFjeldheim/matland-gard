import { prisma } from '@/lib/prisma';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { retryVippsPayment } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; vipps?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Check for success from either Stripe or Vipps
  const paymentSuccess = success === 'true' || (await searchParams).vipps === 'success';
  let isVerifiedPaid = false;

  if (paymentSuccess && order.status === 'pending') {
    if (order.paymentMethod === 'stripe' && success === 'true') {
      isVerifiedPaid = true;
    } else if (order.paymentMethod === 'vipps' && (await searchParams).vipps === 'success') {
      try {
        const { getVippsPayment } = await import('@/app/lib/vipps');
        const paymentDetails = await getVippsPayment(id);
        if (paymentDetails.state === 'AUTHORIZED') {
          isVerifiedPaid = true;
        } else {
          console.log(`Vipps payment not authorized for order ${id}. Status: ${paymentDetails.state}`);
        }
      } catch (error) {
        console.error(`Failed to verify Vipps payment for order ${id}:`, error);
      }
    }
  }

  if (isVerifiedPaid) {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'paid' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Send confirmation emails (fallback if webhook is slow or fails)
    try {
      const { sendCustomerOrderConfirmation, sendAdminOrderNotification } = await import('@/lib/email');
      const orderEmailData = {
        orderId: updatedOrder.id,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        customerPhone: updatedOrder.customerPhone,
        deliveryAddress: updatedOrder.deliveryAddress,
        totalAmount: updatedOrder.totalAmount,
        shippingMethod: updatedOrder.shippingMethod,
        status: updatedOrder.status,
        orderItems: updatedOrder.orderItems,
      };

      await Promise.all([
        sendCustomerOrderConfirmation(orderEmailData),
        sendAdminOrderNotification(orderEmailData),
      ]);
      console.log(`Confirmation emails sent via success page fallback for order: ${id}`);
    } catch (emailError) {
      console.error(`Error sending emails via success page fallback for order ${id}:`, emailError);
    }

    // Update local order object
    Object.assign(order, updatedOrder);
  }

  const statusTexts: Record<string, string> = {
    pending: 'Venter på betaling',
    paid: 'Betalt',
    processing: 'Under behandling',
    delivered: 'Levert',
    cancelled: 'Kansellert',
  };
  const statusText = statusTexts[order.status] || order.status;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--color-dark)] text-white">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-[var(--color-accent)]/20 border border-[var(--color-primary)] rounded-lg p-6 mb-8 text-center">
            <svg className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {order.status === 'paid' ? 'Takk for din bestilling!' : 'Bestilling mottatt'}
            </h2>
            <p className="text-gray-600">
              Ordrenummer: <span className="font-mono font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ordredetaljer</h3>
              <span className={`px-4 py-2 rounded-full font-semibold ${statusColor}`}>
                {statusText}
              </span>
            </div>

            {/* Customer Info */}
            <div className="border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Kundeinformasjon</h4>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Navn:</span> {order.customerName}</p>
                <p><span className="font-medium">E-post:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Telefon:</span> {order.customerPhone}</p>
                {order.shippingMethod && (
                  <p>
                    <span className="font-medium">Levering:</span>{' '}
                    {order.shippingMethod === 'pickup'
                      ? 'Henting i Holmefjord'
                      : 'Vi sender tilbud på frakt'}
                  </p>
                )}
                {order.deliveryAddress && (
                  <p><span className="font-medium">Leveringsadresse:</span> {order.deliveryAddress}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b pb-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Produkter</h4>
              <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Antall: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {((item.price * item.quantity) / 100).toFixed(0)} kr
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-900">Totalt</span>
              <span className="font-bold text-[var(--color-primary)]">
                {(order.totalAmount / 100).toFixed(0)} kr
              </span>
            </div>


          </div>


          {/* Retry Payment for Vipps */}
          {order.paymentMethod === 'vipps' && order.status === 'pending' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h4 className="text-red-800 font-semibold mb-2">Betaling ikke gjennomført</h4>
              <p className="text-red-700 mb-4">
                Betalingen ble avbrutt eller feilet. Ingen penger er trukket fra din konto.
              </p>
              <form action={async () => {
                'use server';
                await retryVippsPayment(order.id);
              }}>
                <button
                  type="submit"
                  className="bg-[#FF5B24] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E64E1B] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Betal med Vipps</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-3">Hva skjer nå?</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Vi behandler din bestilling</li>
              <li>Du mottar en e-postbekreftelse</li>
              {order.shippingMethod === 'pickup' ? (
                <li>Vi kontakter deg for å avtale dato for henting i Holmefjord</li>
              ) : (
                <>
                  <li>Vi kontakter deg med pristilbud på frakt</li>
                  <li>Etter godkjenning arrangerer vi levering</li>
                </>
              )}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/nettbutikk"
              className="flex-1 bg-[var(--color-primary)] text-white text-center px-6 py-3 rounded-lg hover:bg-[var(--color-dark)] transition-colors font-semibold">
              Se flere produkter
            </Link>
            <Link
              href="/"
              className="flex-1 bg-white text-gray-700 text-center px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold border border-gray-300"
            >
              Tilbake til forsiden
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center text-gray-600">
            <p>Spørsmål om din bestilling?</p>
            <p className="mt-2">
              <a href="tel:+4795458563" className="text-[var(--color-primary)] hover:underline font-semibold">
                +47 954 58 563
              </a>
              {' eller '}
              <a href="mailto:matlandgard@gmail.com" className="text-[var(--color-primary)] hover:underline font-semibold">
                matlandgard@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
