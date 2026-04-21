import Link from "next/link";

import { AdminPeriodFilter } from "@/components/admin/AdminPeriodFilter";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { getPaymentDashboard, getPaymentMonthOptions, parsePaymentRange } from "@/lib/payments";

export const dynamic = "force-dynamic";

interface AdminPaymentsPageProps {
  searchParams?: Promise<{
    period?: string;
    month?: string;
  }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  const params = (await searchParams) ?? {};
  const filter = parsePaymentRange(params);
  const [dashboard, monthOptions] = await Promise.all([getPaymentDashboard(filter), getPaymentMonthOptions()]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Payments"
        title="Payments overview"
        description={`Showing ${dashboard.filter.label.toLowerCase()} so you can check money received and what still needs follow-up.`}
        primaryAction={{ href: "/admin/payments/new", label: "Record payment" }}
        secondaryAction={{ href: "/admin/payments/list", label: "Open payment list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/payments", label: "Overview", active: true },
          { href: "/admin/payments/list", label: "Payment list" },
        ]}
      />
      <AdminPeriodFilter action="/admin/payments" current={dashboard.filter} monthOptions={monthOptions} />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Orders" value={String(dashboard.totals.orders)} />
        <AdminMetricCard label={`Money received (${dashboard.filter.label})`} value={formatCurrency(dashboard.totals.collected_amount)} tone="success" />
        <AdminMetricCard label="Still to collect" value={formatCurrency(dashboard.totals.outstanding_amount)} tone="warning" />
        <AdminMetricCard label="Part paid" value={String(dashboard.buckets.partial.length)} tone="accent" />
        <AdminMetricCard label="Payment problems" value={String(dashboard.buckets.failed.length)} />
      </section>

      <section className="admin-command-grid">
        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">Needs follow-up</p>
              <h2 className="admin-section-title">Waiting for payment</h2>
            </div>
            <Link className="secondary-pill" href="/admin/payments/list">
              View all
            </Link>
          </div>
          <div className="admin-list-rows">
            {dashboard.buckets.pending.slice(0, 5).map((row) => (
              <Link key={row.id} href={`/admin/payments/${row.id}`} className="admin-list-row">
                <div>
                  <strong>{row.reference}</strong>
                  <span>{row.customer_name}</span>
                </div>
                <div>
                  <strong>{formatCurrency(row.balance_due)}</strong>
                  <span>Still to collect</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-panel admin-list-card">
          <div className="admin-panel-head">
            <div>
              <p className="eyebrow">In progress</p>
              <h2 className="admin-section-title">Part-paid orders</h2>
            </div>
          </div>
          <div className="admin-list-rows">
            {dashboard.buckets.partial.length === 0 ? (
              <div className="admin-list-row static">
                <div>
                  <strong>No part-paid orders</strong>
                  <span>Partial payments will appear here when they happen.</span>
                </div>
              </div>
            ) : (
              dashboard.buckets.partial.slice(0, 5).map((row) => (
                <Link key={row.id} href={`/admin/payments/${row.id}`} className="admin-list-row">
                  <div>
                    <strong>{row.reference}</strong>
                    <span>{row.customer_name}</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(row.balance_due)}</strong>
                    <span>{formatCurrency(row.amount_paid)} received</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  );
}

function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}
