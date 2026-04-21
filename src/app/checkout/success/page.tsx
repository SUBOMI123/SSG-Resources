import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/OrderReceipt";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { getOrderByReference } from "@/lib/orders";
import { buildCheckoutWhatsAppUrl, getBusinessWhatsAppDisplayNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    reference?: string;
    channel?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  if (!params.reference) {
    notFound();
  }

  const order = await getOrderByReference(params.reference);
  if (!order) {
    notFound();
  }

  const whatsappUrl = buildCheckoutWhatsAppUrl(order);
  const whatsappCheckout = params.channel === "whatsapp";

  return (
    <main className="shell storefront-shell">
      <div className="section-head">
        <div>
          <p className="eyebrow">Checkout result</p>
          <h1 className="section-title">Order confirmation</h1>
        </div>
        <Link href={`/orders/${order.reference}`} className="text-link">
          Track order
        </Link>
      </div>

      {whatsappCheckout ? (
        <section className="card checkout-banner">
          <strong>Order saved: {order.reference}</strong>
          <p>
            Next step: open WhatsApp and send this order to the team so they can confirm payment and processing.
          </p>
          <div className="checkout-actions">
            <a className="primary-pill" href={whatsappUrl} rel="noreferrer" target="_blank">
              Open WhatsApp
            </a>
            <span className="stock-note">Business WhatsApp: {getBusinessWhatsAppDisplayNumber()}</span>
          </div>
        </section>
      ) : null}

      <div className="checkout-layout">
        <OrderStatusCard
          payment_status={order.payment_status}
          fulfillment_status={order.fulfillment_status}
        />
        <OrderReceipt order={order} />
      </div>
    </main>
  );
}
