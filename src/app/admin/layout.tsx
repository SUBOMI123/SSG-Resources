import Link from "next/link";

import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getCurrentAdmin();

  return (
    <div className="admin-app-shell">
      <header className="admin-topbar admin-panel admin-topbar-full">
        <div>
          <p className="eyebrow">Business overview</p>
          <h1 className="admin-title">Admin page</h1>
        </div>
        <p className="admin-copy">
          Use overview pages to see the full picture, list pages to find records, and detail pages to make changes.
        </p>
      </header>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar-brand">
          <span className="eyebrow">SSG</span>
          <strong>Business Admin</strong>
          <p>Orders, stock, payments, and finance in one place.</p>
        </Link>
        <AdminNav />
        <div className="admin-sidebar-footer">
          {admin ? <span className="admin-user-badge">Signed in as {admin.name}</span> : null}
          {admin ? <AdminLogoutButton /> : null}
        </div>
      </aside>
      <main className="admin-main-shell">
        <div className="admin-page-stack">{children}</div>
      </main>
    </div>
  );
}
