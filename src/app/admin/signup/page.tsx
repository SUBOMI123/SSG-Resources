import Link from "next/link";

import { AdminAuthForm } from "@/components/AdminAuthForm";
import { getCurrentAdmin, hasAdminUsers } from "@/lib/admin-auth";

export default async function AdminSignupPage() {
  const admin = await getCurrentAdmin();
  const setupComplete = await hasAdminUsers();

  if (setupComplete && !admin) {
    return (
      <main className="shell storefront-shell">
        <section className="card auth-helper-card">
          <p className="eyebrow">Setup complete</p>
          <h1 className="section-title" style={{ fontSize: "2.3rem" }}>
            Admin account already exists
          </h1>
          <p className="section-copy">
            The admin area is already protected. Sign in with the existing admin account.
          </p>
          <Link className="text-link" href="/admin/login">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="shell storefront-shell">
      {admin ? (
        <section className="card auth-helper-card">
          <p className="eyebrow">Already signed in</p>
          <h1 className="section-title" style={{ fontSize: "2.3rem" }}>
            Admin access is active
          </h1>
          <p className="section-copy">You can return to the dashboard now.</p>
          <Link className="text-link" href="/admin/inventory">
            Open admin area
          </Link>
        </section>
      ) : (
        <AdminAuthForm mode="signup" />
      )}
    </main>
  );
}
