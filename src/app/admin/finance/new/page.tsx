import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";

export default function AdminFinanceNewPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Finance"
        title="Add finance note"
        description="Finance records in this system come from real actions like creating an order or recording payment. Choose the correct place below."
        secondaryAction={{ href: "/admin/finance/list", label: "Back to finance list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/finance", label: "Overview" },
          { href: "/admin/finance/list", label: "Finance list" },
        ]}
      />
      <section className="admin-command-grid">
        <Link href="/admin/orders/new" className="admin-panel admin-quick-link-card">
          <p className="eyebrow">Path 1</p>
          <h2 className="admin-section-title">Add a new order</h2>
          <p className="admin-muted-copy">
            Use this when the business has made a sale and you need to create the order record first.
          </p>
        </Link>
        <Link href="/admin/payments/new" className="admin-panel admin-quick-link-card">
          <p className="eyebrow">Path 2</p>
          <h2 className="admin-section-title">Record a payment</h2>
          <p className="admin-muted-copy">
            Use this when the order already exists and you just need to capture money received.
          </p>
        </Link>
      </section>
    </>
  );
}
