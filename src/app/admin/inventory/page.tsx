import Link from "next/link";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { listInventory } from "@/lib/inventory";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await listInventory();
  const [recentMovements, lowStockItems] = await Promise.all([
    prisma.inventoryHistory.findMany({
      orderBy: [{ created_at: "desc" }],
      take: 6,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { available: { lt: 50 } },
      orderBy: [{ available: "asc" }],
      take: 5,
    }),
  ]);

  const totalOnHand = items.reduce((sum, item) => sum + item.quantity_on_hand, 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.available, 0);
  const totalValue = items.reduce((sum, item) => sum + item.unit_price * item.quantity_on_hand, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Stock"
        title="Stock overview"
        description="See your stock position first, then open the stock list or product page when you want to make changes."
        primaryAction={{ href: "/admin/inventory/new", label: "Add product" }}
        secondaryAction={{ href: "/admin/inventory/list", label: "Open stock list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/inventory", label: "Overview", active: true },
          { href: "/admin/inventory/list", label: "Stock list" },
        ]}
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Products" value={String(items.length)} />
        <AdminMetricCard label="Units on hand" value={totalOnHand.toLocaleString()} />
        <AdminMetricCard label="Units available" value={totalAvailable.toLocaleString()} tone="success" />
        <AdminMetricCard label="Low stock" value={String(lowStockItems.length)} tone="warning" />
        <AdminMetricCard label="Stock value" value={`₦${totalValue.toLocaleString()}`} tone="accent" />
      </section>

      <section className="admin-command-grid">
        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Action needed</p>
              <h2 className="admin-section-title">Products running low</h2>
            </div>
            <Link className="secondary-pill" href="/admin/inventory/list">
              View all
            </Link>
          </div>
          <div className="admin-list-rows">
            {lowStockItems.length === 0 ? (
              <div className="admin-list-row static">
                <div>
                  <strong>No low-stock products</strong>
                  <span>All products are above the warning level for now.</span>
                </div>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <Link key={item.id} href={`/admin/inventory/${item.id}`} className="admin-list-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.sku} · Warning level under 50 units</span>
                  </div>
                  <div>
                    <strong>#{item.available}</strong>
                    <span>{item.available < 20 ? "Very low" : "Low stock"}</span>
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
              <h2 className="admin-section-title">Latest stock changes</h2>
            </div>
          </div>
          <div className="admin-list-rows">
            {recentMovements.map((entry) => (
              <Link key={entry.id} href={`/admin/inventory/${entry.product_id}`} className="admin-list-row">
                <div>
                  <strong>{entry.product.name}</strong>
                  <span>{entry.change_reason.replace(/_/g, " ")} by {entry.changed_by}</span>
                </div>
                <div>
                  <strong>
                    {entry.previous_quantity} → {entry.new_quantity}
                  </strong>
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
