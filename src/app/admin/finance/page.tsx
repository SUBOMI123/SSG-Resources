import Link from "next/link";

import { AdminPeriodFilter } from "@/components/admin/AdminPeriodFilter";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { getFinancialDashboard, getPaymentMonthOptions, parsePaymentRange } from "@/lib/payments";

export const dynamic = "force-dynamic";

interface AdminFinancePageProps {
  searchParams?: Promise<{
    period?: string;
    month?: string;
  }>;
}

export default async function AdminFinancePage({ searchParams }: AdminFinancePageProps) {
  const params = (await searchParams) ?? {};
  const filter = parsePaymentRange(params);
  const [dashboard, monthOptions] = await Promise.all([getFinancialDashboard(filter), getPaymentMonthOptions()]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Finance"
        title="Finance overview"
        description={`Showing ${dashboard.filter.label.toLowerCase()} so you can compare sales, money received, and money still outstanding.`}
        primaryAction={{ href: "/admin/finance/new", label: "Add finance note" }}
        secondaryAction={{ href: "/admin/finance/list", label: "Open finance list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/finance", label: "Overview", active: true },
          { href: "/admin/finance/list", label: "Finance list" },
        ]}
      />
      <AdminPeriodFilter action="/admin/finance" current={dashboard.filter} monthOptions={monthOptions} />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Total sales" value={formatCurrency(dashboard.totals.total_sales)} />
        <AdminMetricCard label={`Money received (${dashboard.filter.label})`} value={formatCurrency(dashboard.totals.collected_amount)} tone="success" />
        <AdminMetricCard label="Waiting for payment" value={formatCurrency(dashboard.totals.outstanding_amount)} tone="warning" />
        <AdminMetricCard label="Average order" value={formatCurrency(dashboard.totals.average_order_value)} />
        <AdminMetricCard label="Paid rate" value={`${Math.round(dashboard.totals.paid_order_rate * 100)}%`} tone="accent" />
      </section>

      <section className="admin-command-grid">
        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Channels</p>
              <h2 className="admin-section-title">Sales by source</h2>
            </div>
          </div>
          <div className="admin-list-rows">
            <div className="admin-list-row static">
              <div>
                <strong>Website orders</strong>
                <span>Customer self-service orders</span>
              </div>
              <div>
                <strong>{formatCurrency(dashboard.source_breakdown.web_amount)}</strong>
              </div>
            </div>
            <div className="admin-list-row static">
              <div>
                <strong>Orders added here</strong>
                <span>Manual orders created by the team</span>
              </div>
              <div>
                <strong>{formatCurrency(dashboard.source_breakdown.manual_amount)}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2 className="admin-section-title">Recent finance records</h2>
            </div>
            <Link className="secondary-pill" href="/admin/finance/list">
              View ledger
            </Link>
          </div>
          <div className="admin-list-rows">
            {dashboard.recent_orders.map((order) => (
              <Link key={order.id} href={`/admin/finance/${order.id}`} className="admin-list-row">
                <div>
                  <strong>{order.reference}</strong>
                  <span>{order.customer_name}</span>
                </div>
                <div>
                  <strong>{formatCurrency(order.total)}</strong>
                  <span>{simplePaymentStatus(order.payment_status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
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
