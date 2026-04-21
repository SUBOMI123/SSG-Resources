import Link from "next/link";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [inventoryCount, lowStockCount, orderCount, openOrders, outstanding] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { available: { lt: 50 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { fulfillment_status: { not: "DELIVERED" } } }),
    prisma.order.aggregate({ _sum: { balance_due: true } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: [{ created_at: "desc" }],
    take: 5,
    select: {
      id: true,
      reference: true,
      customer_name: true,
      total: true,
      payment_status: true,
      fulfillment_status: true,
    },
  });
  type RecentOrder = (typeof recentOrders)[number];

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Business summary"
        description="Start here to quickly see stock, orders, payments, and finance. Then open the right section to work on the exact item you need."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Products listed" value={String(inventoryCount)} />
        <AdminMetricCard label="Low-stock alerts" value={String(lowStockCount)} tone="warning" />
        <AdminMetricCard label="Open orders" value={String(openOrders)} tone="accent" />
        <AdminMetricCard label="Money still due" value={`₦${(outstanding._sum.balance_due ?? 0).toLocaleString()}`} tone="warning" />
        <AdminMetricCard label="Orders total" value={String(orderCount)} />
      </section>

      <section className="admin-command-grid">
        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h2 className="admin-section-title">What do you want to do?</h2>
            </div>
          </div>
          <div className="admin-quick-links">
            <Link href="/admin/orders/list" className="admin-quick-link">
              <strong>Check orders</strong>
              <span>Search, filter, and open a specific order.</span>
            </Link>
            <Link href="/admin/orders/new" className="admin-quick-link">
              <strong>Add order</strong>
              <span>Create a manual order and use the raw text parser.</span>
            </Link>
            <Link href="/admin/inventory/list" className="admin-quick-link">
              <strong>Check stock</strong>
              <span>Open the stock list and inspect product details.</span>
            </Link>
            <Link href="/admin/payments/new" className="admin-quick-link">
              <strong>Record payment</strong>
              <span>Save money received for an existing order.</span>
            </Link>
          </div>
        </article>

        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Latest orders</p>
              <h2 className="admin-section-title">Recent updates</h2>
            </div>
            <Link className="secondary-pill" href="/admin/orders/list">
              View all
            </Link>
          </div>
          <div className="admin-list-rows">
            {recentOrders.map((order: RecentOrder) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="admin-list-row">
                <div>
                  <strong>{order.reference}</strong>
                  <span>{order.customer_name}</span>
                </div>
                <div>
                  <strong>₦{order.total.toLocaleString()}</strong>
                  <span>{simpleOrderState(order.fulfillment_status, order.payment_status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function simpleOrderState(
  fulfillmentStatus: "PENDING" | "CONFIRMED" | "DELIVERED",
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "FAILED",
) {
  const fulfillment =
    fulfillmentStatus === "PENDING"
      ? "New"
      : fulfillmentStatus === "CONFIRMED"
        ? "Confirmed"
        : "Delivered";
  const payment =
    paymentStatus === "PENDING"
      ? "Waiting"
      : paymentStatus === "PARTIAL"
        ? "Part paid"
        : paymentStatus === "PAID"
          ? "Paid"
          : "Problem";

  return `${fulfillment} · ${payment}`;
}
