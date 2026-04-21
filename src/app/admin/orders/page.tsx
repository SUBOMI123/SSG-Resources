import Link from "next/link";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { listAdminOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();
  type AdminOrderRow = (typeof orders)[number];
  const waitingOrders = orders.filter((order: AdminOrderRow) => order.payment_status !== "PAID");
  const openOrders = orders.filter((order: AdminOrderRow) => order.fulfillment_status !== "DELIVERED");
  const confirmedOrders = orders.filter((order: AdminOrderRow) => order.fulfillment_status === "CONFIRMED");
  const waitingAmount = waitingOrders.reduce((sum, order: AdminOrderRow) => sum + order.balance_due, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Orders"
        title="Orders overview"
        description="See your orders first, then open the order list to find the exact one you want to work on."
        primaryAction={{ href: "/admin/orders/new", label: "Add order" }}
        secondaryAction={{ href: "/admin/orders/list", label: "Open order list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/orders", label: "Overview", active: true },
          { href: "/admin/orders/list", label: "Order list" },
        ]}
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Orders total" value={String(orders.length)} />
        <AdminMetricCard label="Open orders" value={String(openOrders.length)} tone="accent" />
        <AdminMetricCard label="Confirmed orders" value={String(confirmedOrders.length)} />
        <AdminMetricCard label="Balance still due" value={`₦${waitingAmount.toLocaleString()}`} tone="warning" />
      </section>

      <section className="admin-command-grid">
        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Payment follow-up</p>
              <h2 className="admin-section-title">Orders waiting for payment</h2>
            </div>
            <Link className="secondary-pill" href="/admin/payments/list">
              Open payments
            </Link>
          </div>
          <div className="admin-list-rows">
            {waitingOrders.length === 0 ? (
              <div className="admin-list-row static">
                <div>
                  <strong>No outstanding payment right now</strong>
                  <span>All current orders are fully paid.</span>
                </div>
              </div>
            ) : (
              waitingOrders.slice(0, 6).map((order: AdminOrderRow) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="admin-list-row">
                  <div>
                    <strong>{order.customer_name}</strong>
                    <span>{order.reference}</span>
                  </div>
                  <div>
                    <strong>₦{order.balance_due.toLocaleString()}</strong>
                    <span>{paymentLabel(order.payment_status)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 className="admin-section-title">Latest orders</h2>
            </div>
            <Link className="secondary-pill" href="/admin/orders/list">
              View all
            </Link>
          </div>
          <div className="admin-list-rows">
            {orders.slice(0, 6).map((order: AdminOrderRow) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="admin-list-row">
                <div>
                  <strong>{order.reference}</strong>
                  <span>{order.customer_name}</span>
                </div>
                <div>
                  <strong>₦{order.total.toLocaleString()}</strong>
                  <span>{simpleOrderStage(order.fulfillment_status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function paymentLabel(value: "PENDING" | "PARTIAL" | "PAID" | "FAILED") {
  if (value === "PENDING") return "Waiting";
  if (value === "PARTIAL") return "Part paid";
  if (value === "PAID") return "Paid";
  return "Problem";
}

function simpleOrderStage(value: "PENDING" | "CONFIRMED" | "DELIVERED") {
  if (value === "PENDING") return "New";
  if (value === "CONFIRMED") return "Confirmed";
  return "Delivered";
}
