"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CatalogProductDetail } from "@/types/catalog";
import type { CheckoutResponse } from "@/types/order";

interface CheckoutFormProps {
  product: CatalogProductDetail;
  quantity: number;
}

export function CheckoutForm({ product, quantity }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      customer_name: String(formData.get("customer_name") ?? ""),
      customer_email: String(formData.get("customer_email") ?? ""),
      customer_phone: String(formData.get("customer_phone") ?? ""),
      delivery_address: String(formData.get("delivery_address") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      items: [
        {
          product_slug: product.slug,
          quantity,
        },
      ],
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CheckoutResponse & { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Checkout failed.");
      }

      router.push(`/checkout/success?reference=${data.order.reference}&channel=whatsapp`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card checkout-form" onSubmit={handleSubmit}>
      <p className="eyebrow">Customer details</p>
      <p className="section-copy">
        We will save this order first, then take you to WhatsApp so you can confirm payment with the team.
      </p>
      <div className="form-grid">
        <label className="checkout-field">
          <span>Full name</span>
          <input name="customer_name" required />
        </label>
        <label className="checkout-field">
          <span>Email address</span>
          <input name="customer_email" type="email" required />
        </label>
        <label className="checkout-field">
          <span>Phone number</span>
          <input name="customer_phone" type="tel" required />
        </label>
        <label className="checkout-field checkout-field-wide">
          <span>Delivery address</span>
          <textarea name="delivery_address" rows={4} required />
        </label>
        <label className="checkout-field checkout-field-wide">
          <span>Order notes</span>
          <textarea name="notes" rows={3} placeholder="Optional delivery or contact notes" />
        </label>
      </div>

      {error ? <p className="checkout-error">{error}</p> : null}

      <div className="checkout-actions">
        <button type="submit" className="primary-pill" disabled={loading}>
          {loading ? "Saving order..." : "Send order on WhatsApp"}
        </button>
      </div>
    </form>
  );
}
