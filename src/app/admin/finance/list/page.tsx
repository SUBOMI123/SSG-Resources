import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { getFinancialDashboard, parsePaymentRange } from "@/lib/payments";

export const dynamic = "force-dynamic";

interface FinanceListPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function AdminFinanceListPage({ searchParams }: FinanceListPageProps) {
  const params = (await searchParams) ?? {};
  const dashboard = await getFinancialDashboard(parsePaymentRange({ period: "all" }));
  const term = params.q?.trim().toLowerCase() ?? "";
  type FinanceRow = (typeof dashboard.recent_orders)[number];

  const rows = dashboard.recent_orders.filter((order: FinanceRow) => {
    if (!term) {
      return true;
    }
    return [order.reference, order.customer_name].join(" ").toLowerCase().includes(term);
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Finance"
        title="Finance list"
        description="Use this page to check finance records in a table, then open one record for more details."
        primaryAction={{ href: "/admin/finance/new", label: "Add finance note" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/finance", label: "Overview" },
          { href: "/admin/finance/list", label: "Finance list", active: true },
        ]}
      />

      <section className="admin-panel">
        <form className="admin-toolbar" action="/admin/finance/list">
          <label className="checkout-field">
            <span>Search</span>
            <input defaultValue={params.q ?? ""} name="q" placeholder="Reference or customer" />
          </label>
          <div className="admin-toolbar-actions">
            <button className="secondary-pill" type="submit">
              Apply
            </button>
          </div>
        </form>

        {rows.length === 0 ? (
          <AdminEmptyState
            title="No finance records found"
            body="Try a different search or add a record through orders or payments."
          />
        ) : (
          <div className="admin-table-shell">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Source</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order: FinanceRow) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/finance/${order.id}`} className="admin-table-link">
                        {order.reference}
                      </Link>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>{order.source === "WEB" ? "Website" : "Added here"}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{formatCurrency(order.amount_paid)}</td>
                    <td>{formatCurrency(order.balance_due)}</td>
                    <td>{simplePaymentStatus(order.payment_status)}</td>
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

function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}

function simplePaymentStatus(value: "PENDING" | "PARTIAL" | "PAID" | "FAILED") {
  if (value === "PENDING") return "Waiting";
  if (value === "PARTIAL") return "Part paid";
  if (value === "PAID") return "Paid";
  return "Problem";
}
