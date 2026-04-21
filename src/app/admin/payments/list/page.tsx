import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { prisma } from "@/lib/db";

interface PaymentsListPageProps {
  searchParams?: Promise<{
    q?: string;
    payment?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminPaymentsListPage({ searchParams }: PaymentsListPageProps) {
  const params = (await searchParams) ?? {};
  const orders = await prisma.order.findMany({
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      reference: true,
      customer_name: true,
      payment_status: true,
      fulfillment_status: true,
      total: true,
      amount_paid: true,
      balance_due: true,
      created_at: true,
    },
  });
  type PaymentListOrder = (typeof orders)[number];

  const term = params.q?.trim().toLowerCase() ?? "";
  const paymentFilter = params.payment ?? "ALL";
  const filteredOrders = orders.filter((order: PaymentListOrder) => {
    if (paymentFilter !== "ALL" && order.payment_status !== paymentFilter) {
      return false;
    }

    if (!term) {
      return true;
    }

    return [order.reference, order.customer_name].join(" ").toLowerCase().includes(term);
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Payments"
        title="Payment list"
        description="Browse all payment records in one table, then open a detail page to check history or add another payment."
        primaryAction={{ href: "/admin/payments/new", label: "Record payment" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/payments", label: "Overview" },
          { href: "/admin/payments/list", label: "Payment list", active: true },
        ]}
      />

      <section className="admin-panel">
        <form className="admin-toolbar admin-toolbar-grid" action="/admin/payments/list">
          <label className="checkout-field">
            <span>Search</span>
            <input defaultValue={params.q ?? ""} name="q" placeholder="Reference or customer" />
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
          <div className="admin-toolbar-actions">
            <button className="secondary-pill" type="submit">
              Apply
            </button>
          </div>
        </form>

        {filteredOrders.length === 0 ? (
          <AdminEmptyState
            title="No payment records match the current filters"
            body="Try a different search or record a payment."
          />
        ) : (
          <div className="admin-table-shell">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Progress</th>
                  <th>Total</th>
                  <th>Paid so far</th>
                  <th>Balance left</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: PaymentListOrder) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/payments/${order.id}`} className="admin-table-link">
                        {order.reference}
                      </Link>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>{simplePaymentStatus(order.payment_status)} / {simpleOrderStage(order.fulfillment_status)}</td>
                    <td>₦{order.total.toLocaleString()}</td>
                    <td>₦{order.amount_paid.toLocaleString()}</td>
                    <td>₦{order.balance_due.toLocaleString()}</td>
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
