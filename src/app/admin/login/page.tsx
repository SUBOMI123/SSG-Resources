import Link from "next/link";

import { AdminAuthForm } from "@/components/AdminAuthForm";
import { getCurrentAdmin, hasAdminUsers } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  const setupComplete = await hasAdminUsers();

  return (
    <main className="shell storefront-shell">
      {admin ? null : <AdminAuthForm mode="login" />}

      {!setupComplete ? (
        <section className="card auth-helper-card">
          <p className="eyebrow">First-time setup</p>
          <h2 className="section-title" style={{ fontSize: "1.8rem" }}>
            No admin account yet
          </h2>
          <p className="section-copy">
            Start by creating the first admin account for the business.
          </p>
          <Link className="text-link" href="/admin/signup">
            Go to admin setup
          </Link>
        </section>
      ) : null}
    </main>
  );
}
