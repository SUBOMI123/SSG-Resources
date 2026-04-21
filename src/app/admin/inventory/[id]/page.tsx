import { notFound } from "next/navigation";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { InventoryDetailActions } from "@/components/admin/InventoryDetailActions";
import { prisma } from "@/lib/db";
import { getInventory } from "@/lib/inventory";

type InventoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminInventoryDetailPage({ params }: InventoryDetailPageProps) {
  const { id } = await params;
  const item = await getInventory(id);

  if (!item) {
    notFound();
  }

  const history = await prisma.inventoryHistory.findMany({
    where: { product_id: id },
    orderBy: [{ created_at: "desc" }],
    take: 8,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Stock detail"
        title={item.name}
        description="Use this page to check stock level, see recent changes, and update the product without crowding the main stock page."
        secondaryAction={{ href: "/admin/inventory/list", label: "Back to stock list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/inventory", label: "Overview" },
          { href: "/admin/inventory/list", label: "Stock list" },
          { href: `/admin/inventory/${item.id}`, label: "Details", active: true },
        ]}
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="SKU" value={item.sku} />
        <AdminMetricCard label="On hand" value={String(item.quantity_on_hand)} />
        <AdminMetricCard label="Reserved" value={String(item.reserved)} tone="warning" />
        <AdminMetricCard label="Available" value={String(item.available)} tone={item.available < 50 ? "warning" : "success"} />
        <AdminMetricCard label="Unit price" value={`₦${item.unit_price.toLocaleString()}`} />
      </section>

      <section className="admin-detail-grid">
        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Product summary</p>
              <h2 className="admin-section-title">Current stock position</h2>
            </div>
          </div>
          <dl className="admin-detail-list">
            <div>
              <dt>Name</dt>
              <dd>{item.name}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>{item.slug}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>{item.description ?? "No description added yet."}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{new Date(item.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
          <InventoryDetailActions item={item} />
        </article>

        <article className="admin-panel admin-detail-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Stock history</p>
              <h2 className="admin-section-title">Recent movements</h2>
            </div>
          </div>
          <div className="admin-list-rows">
            {history.map((entry) => (
              <div key={entry.id} className="admin-list-row static">
                <div>
                  <strong>{entry.change_reason.replace(/_/g, " ")}</strong>
                  <span>{entry.changed_by}</span>
                </div>
                <div>
                  <strong>
                    {entry.previous_quantity} → {entry.new_quantity}
                  </strong>
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
