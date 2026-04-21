import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { listInventory } from "@/lib/inventory";

interface InventoryListPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminInventoryListPage({ searchParams }: InventoryListPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim().toLowerCase() ?? "";
  const items = await listInventory();
  const filteredItems = query
    ? items.filter((item) =>
        [item.name, item.sku, item.slug, item.description ?? ""].join(" ").toLowerCase().includes(query),
      )
    : items;

  return (
    <>
      <AdminPageHeader
        eyebrow="Stock"
        title="Stock list"
        description="Browse every product in one table. Open any row to update stock or see full details."
        primaryAction={{ href: "/admin/inventory/new", label: "Add product" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/inventory", label: "Overview" },
          { href: "/admin/inventory/list", label: "Stock list", active: true },
        ]}
      />

      <section className="admin-panel">
        <form className="admin-toolbar" action="/admin/inventory/list">
          <label className="checkout-field">
            <span>Search stock</span>
            <input defaultValue={params.q ?? ""} name="q" placeholder="Product, SKU, slug" />
          </label>
          <div className="admin-toolbar-actions">
            <button className="secondary-pill" type="submit">
              Apply
            </button>
          </div>
        </form>

        {filteredItems.length === 0 ? (
          <AdminEmptyState
            title="No stock records found"
            body="Try a different search or add a new product."
          />
        ) : (
          <div className="admin-table-shell">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>On hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/admin/inventory/${item.id}`} className="admin-table-link">
                        {item.sku}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/inventory/${item.id}`} className="admin-table-link-stack">
                        <strong>{item.name}</strong>
                        <span>{item.description ?? "No description added yet."}</span>
                      </Link>
                    </td>
                    <td>₦{item.unit_price.toLocaleString()}</td>
                    <td>{item.quantity_on_hand}</td>
                    <td>{item.reserved}</td>
                    <td>
                      <span className={item.available < 50 ? "admin-status danger" : item.available < 100 ? "admin-status warning" : "admin-status success"}>
                        {item.available}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
