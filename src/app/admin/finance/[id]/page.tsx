import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { prisma } from "@/lib/db";

type FinanceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminFinanceDetailPage({ params }: FinanceDetailPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
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
        eyebrow="Finance detail"
        title={order.reference}
        description="This page shows one finance record clearly: total value, money received, balance left, and payment history."
        secondaryAction={{ href: "/admin/finance/list", label: "Back to finance list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/finance", label: "Overview" },
          { href: "/admin/finance/list", label: "Finance list" },
          { href: `/admin/finance/${order.id}`, label: "Details", active: true },
        ]}
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Total value" value={`₦${order.total.toLocaleString()}`} />
        <AdminMetricCard label="Money received" value={`₦${order.amount_paid.toLocaleString()}`} tone="success" />
        <AdminMetricCard label="Balance left" value={`₦${order.balance_due.toLocaleString()}`} tone={order.balance_due > 0 ? "warning" : "success"} />
        <AdminMetricCard label="Payment status" value={simplePaymentStatus(order.payment_status)} />
      </section>

      <section className="admin-detail-grid">
        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Record summary</p>
              <h2 className="admin-section-title">Finance view</h2>
            </div>
            <div className="admin-inline-actions">
              <Link className="secondary-pill" href={`/admin/orders/${order.id}`}>
                Open order
              </Link>
              <Link className="secondary-pill" href={`/admin/payments/${order.id}`}>
                Open payment record
              </Link>
            </div>
          </div>
          <dl className="admin-detail-list">
            <div>
              <dt>Customer</dt>
              <dd>{order.customer_name}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{order.source === "WEB" ? "Website" : "Added here"}</dd>
            </div>
            <div>
              <dt>Order date</dt>
              <dd>{new Date(order.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Paid date</dt>
              <dd>{order.paid_at ? new Date(order.paid_at).toLocaleString() : "Not fully paid yet"}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Payments</p>
              <h2 className="admin-section-title">Money received timeline</h2>
            </div>
          </div>
          <div className="admin-list-rows">
            {order.payments.length === 0 ? (
              <div className="admin-list-row static">
                <div>
                  <strong>No payments recorded yet</strong>
                  <span>Use the payment section to capture money received.</span>
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
