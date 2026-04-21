"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AdminAuthFormProps {
  mode: "login" | "signup";
}

const VALID_ADMIN_PATHS = new Set([
  "/admin",
  "/admin/inventory",
  "/admin/orders",
  "/admin/payments",
  "/admin/finance",
]);

function getNextAdminPath(value: string | null) {
  if (!value) {
    return "/admin/inventory";
  }

  return VALID_ADMIN_PATHS.has(value) ? value : "/admin/inventory";
}

export function AdminAuthForm({ mode }: AdminAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    try {
      const response = await fetch(`/api/admin/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const nextPath = getNextAdminPath(searchParams.get("next"));
      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <div className="auth-head">
        <p className="eyebrow">{mode === "signup" ? "Admin setup" : "Admin sign in"}</p>
        <h1 className="section-title" style={{ fontSize: "2.3rem" }}>
          {mode === "signup" ? "Create the first admin account" : "Sign in to admin"}
        </h1>
        <p className="section-copy">
          {mode === "signup"
            ? "This protects the admin area before the business starts using it daily."
            : "Use your admin email and password to open the business dashboard."}
        </p>
      </div>

      <div className="auth-grid">
        {mode === "signup" ? (
          <label className="checkout-field">
            <span>Your name</span>
            <input name="name" required />
          </label>
        ) : null}
        <label className="checkout-field">
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <label className="checkout-field">
          <span>Password</span>
          <input name="password" type="password" minLength={8} required />
        </label>
      </div>

      {error ? <p className="checkout-error">{error}</p> : null}

      <div className="checkout-actions">
        <button className="primary-pill" disabled={loading} type="submit">
          {loading
            ? mode === "signup"
              ? "Creating account..."
              : "Signing in..."
            : mode === "signup"
              ? "Create admin account"
              : "Sign in"}
        </button>
      </div>
    </form>
  );
}
