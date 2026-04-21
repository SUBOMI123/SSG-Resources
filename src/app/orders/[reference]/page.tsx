import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/OrderReceipt";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { getOrderByReference } from "@/lib/orders";

export const dynamic = "force-dynamic";

type OrderPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function OrderTrackingPage({ params }: OrderPageProps) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  return (
    <main className="shell storefront-shell">
      <div className="section-head">
        <div>
          <p className="eyebrow">Order tracking</p>
          <h1 className="section-title">Track order {order.reference}</h1>
        </div>
        <div className="checkout-actions">
          <Link href={`/documents/invoice/${order.reference}`} className="secondary-pill">
            Invoice
          </Link>
          <Link href={`/documents/waybill/${order.reference}`} className="secondary-pill">
            Waybill
          </Link>
          <Link href="/products" className="text-link">
            Continue shopping
          </Link>
        </div>
      </div>

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
