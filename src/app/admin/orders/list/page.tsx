import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { listAdminOrders } from "@/lib/orders";

interface OrdersListPageProps {
  searchParams?: Promise<{
    q?: string;
    payment?: string;
    stage?: string;
    source?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersListPage({ searchParams }: OrdersListPageProps) {
  const params = (await searchParams) ?? {};
  const orders = await listAdminOrders();
  const term = params.q?.trim().toLowerCase() ?? "";
  const paymentFilter = params.payment ?? "ALL";
  const stageFilter = params.stage ?? "ALL";
  const sourceFilter = params.source ?? "ALL";

  const filteredOrders = orders.filter((order) => {
    if (paymentFilter !== "ALL" && order.payment_status !== paymentFilter) {
      return false;
    }
    if (stageFilter !== "ALL" && order.fulfillment_status !== stageFilter) {
      return false;
    }
    if (sourceFilter !== "ALL" && order.source !== sourceFilter) {
      return false;
    }
    if (!term) {
      return true;
    }

    return [
      order.reference,
      order.customer_name,
      order.customer_phone,
      order.customer_email,
      order.assigned_to ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Orders"
        title="Order list"
        description="Use this page to search, filter, and open one order at a time."
        primaryAction={{ href: "/admin/orders/new", label: "Add order" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/orders", label: "Overview" },
          { href: "/admin/orders/list", label: "Order list", active: true },
        ]}
      />

      <section className="admin-panel">
        <form className="admin-toolbar admin-toolbar-grid" action="/admin/orders/list">
          <label className="checkout-field">
            <span>Search</span>
            <input defaultValue={params.q ?? ""} name="q" placeholder="Reference, customer, phone, email" />
          </label>
          <label className="checkout-field">
            <span>Payment</span>
            <select defaultValue={paymentFilter} name="payment">
              <option value="ALL">All</option>
              <option value="PENDING">Waiting</option>
              <option value="PARTIAL">Part paid</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Problem</option>
            </select>
          </label>
          <label className="checkout-field">
            <span>Stage</span>
            <select defaultValue={stageFilter} name="stage">
              <option value="ALL">All</option>
              <option value="PENDING">New</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </label>
          <label className="checkout-field">
            <span>Source</span>
            <select defaultValue={sourceFilter} name="source">
              <option value="ALL">All</option>
              <option value="WEB">Website</option>
              <option value="MANUAL">Added here</option>
            </select>
          </label>
          <div className="admin-toolbar-actions">
            <button className="secondary-pill" type="submit">
              Apply
            </button>
          </div>
        </form>

        {filteredOrders.length === 0 ? (
          <AdminEmptyState
            title="No orders match the current filters"
            body="Try a different search or create a new order."
          />
        ) : (
          <div className="admin-table-shell">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Stage</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Handled by</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="admin-table-link">
                        {order.reference}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="admin-table-link-stack">
                        <strong>{order.customer_name}</strong>
                        <span>{order.source === "WEB" ? "Website" : "Added here"}</span>
                      </Link>
                    </td>
                    <td>{simpleOrderStage(order.fulfillment_status)}</td>
                    <td>{simplePaymentStatus(order.payment_status)}</td>
                    <td>₦{order.total.toLocaleString()}</td>
                    <td>₦{order.amount_paid.toLocaleString()}</td>
                    <td>₦{order.balance_due.toLocaleString()}</td>
                    <td>{order.assigned_to ?? "Not assigned"}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
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

function simplePaymentStatus(value: "PENDING" | "PARTIAL" | "PAID" | "FAILED") {
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
