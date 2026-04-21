import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { OrderDetailActions } from "@/components/admin/OrderDetailActions";
import { prisma } from "@/lib/db";

type PaymentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: {
        orderBy: [{ received_at: "desc" }],
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Payment detail"
        title={order.reference}
        description="This page shows money received, remaining balance, and payment history for one order."
        secondaryAction={{ href: "/admin/payments/list", label: "Back to payment list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/payments", label: "Overview" },
          { href: "/admin/payments/list", label: "Payment list" },
          { href: `/admin/payments/${order.id}`, label: "Details", active: true },
        ]}
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Customer" value={order.customer_name} />
        <AdminMetricCard label="Total" value={`₦${order.total.toLocaleString()}`} />
        <AdminMetricCard label="Paid so far" value={`₦${order.amount_paid.toLocaleString()}`} tone="success" />
        <AdminMetricCard label="Balance left" value={`₦${order.balance_due.toLocaleString()}`} tone={order.balance_due > 0 ? "warning" : "success"} />
        <AdminMetricCard label="Payment status" value={simplePaymentStatus(order.payment_status)} />
      </section>

      <section className="admin-detail-grid">
        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Payment history</p>
              <h2 className="admin-section-title">Recorded payments</h2>
            </div>
            <div className="admin-inline-actions">
              <Link className="secondary-pill" href={`/documents/invoice/${order.reference}`}>
                Invoice
              </Link>
              <Link className="secondary-pill" href={`/admin/orders/${order.id}`}>
                Open order
              </Link>
            </div>
          </div>
          <div className="admin-list-rows">
            {order.payments.length === 0 ? (
              <div className="admin-list-row static">
                <div>
                  <strong>No payments recorded yet</strong>
                  <span>Use the action panel to record the first payment.</span>
                </div>
              </div>
            ) : (
              order.payments.map((payment) => (
                <div key={payment.id} className="admin-list-row static">
                  <div>
                    <strong>₦{payment.amount.toLocaleString()}</strong>
                    <span>{payment.note ?? "Payment recorded"}</span>
                  </div>
                  <div>
                    <strong>{payment.recorded_by}</strong>
                    <span>{new Date(payment.received_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Actions</p>
              <h2 className="admin-section-title">Update payment state</h2>
            </div>
          </div>
          <OrderDetailActions
            order={{
              id: order.id,
              reference: order.reference,
              source: order.source,
              assigned_to: order.assigned_to,
              customer_name: order.customer_name,
              customer_email: order.customer_email,
              customer_phone: order.customer_phone,
              delivery_address: order.delivery_address,
              payment_status: order.payment_status,
              fulfillment_status: order.fulfillment_status,
              total: order.total,
              amount_paid: order.amount_paid,
              balance_due: order.balance_due,
              items: order.items.map((item) => ({
                product_id: item.product_id ?? "",
                product_name: item.product_name,
                product_sku: item.product_sku,
                product_slug: item.product_slug,
                unit_price: item.unit_price,
                quantity: item.quantity,
                line_total: item.line_total,
              })),
              payments: order.payments.map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                note: payment.note,
                recorded_by: payment.recorded_by,
                received_at: payment.received_at,
                created_at: payment.created_at,
              })),
              payment_url: order.payment_url,
              created_at: order.created_at,
            }}
          />
        </article>
      </section>
    </>
  );
}

function simplePaymentStatus(value: "PENDING" | "PARTIAL" | "PAID" | "FAILED") {
  if (value === "PENDING") return "Waiting";
  if (value === "PARTIAL") return "Part paid";
  if (value === "PAID") return "Paid";
  return "Problem";
}
