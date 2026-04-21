"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { InventoryCreateRequest } from "@/types/inventory";

type ProductDraft = {
  name: string;
  sku: string;
  slug: string;
  description: string;
  unit_price: string;
  quantity_on_hand: string;
};

const EMPTY_PRODUCT_DRAFT: ProductDraft = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  unit_price: "",
  quantity_on_hand: "",
};

export function InventoryCreateForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_PRODUCT_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const unitPrice = Number(draft.unit_price);
    const quantityOnHand = Number(draft.quantity_on_hand);

    if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isInteger(quantityOnHand) || quantityOnHand < 0) {
      setError("Price must be zero or greater, and opening stock must be a whole number.");
      setSaving(false);
      return;
    }

    try {
      const payload: InventoryCreateRequest = {
        name: draft.name,
        sku: draft.sku,
        slug: draft.slug,
        description: draft.description,
        unit_price: unitPrice,
        quantity_on_hand: quantityOnHand,
        changed_by: "admin-dashboard",
      };

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; message?: string; product?: { id: string } };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to add product.");
      }

      router.push("/admin/inventory/list");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form-shell admin-panel" onSubmit={handleSubmit}>
      <div className="admin-panel-head">
        <div>
          <p className="eyebrow">Create record</p>
          <h2 className="admin-section-title">Add product</h2>
          <p className="admin-muted-copy">
            Create the product once with SKU, price, and opening stock so it appears in the store and admin pages.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="checkout-field">
          <span>Product name</span>
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>
        <label className="checkout-field">
          <span>SKU</span>
          <input
            value={draft.sku}
            onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
            required
          />
        </label>
        <label className="checkout-field">
          <span>Slug</span>
          <input
            value={draft.slug}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                slug: event.target.value.trim().toLowerCase().replace(/\s+/g, "-"),
              }))
            }
            required
          />
        </label>
        <label className="checkout-field">
          <span>Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.unit_price}
            onChange={(event) => setDraft((current) => ({ ...current, unit_price: event.target.value }))}
            required
          />
        </label>
        <label className="checkout-field">
          <span>Opening stock</span>
          <input
            type="number"
            min="0"
            step="1"
            value={draft.quantity_on_hand}
            onChange={(event) => setDraft((current) => ({ ...current, quantity_on_hand: event.target.value }))}
            required
          />
        </label>
        <label className="checkout-field checkout-field-wide">
          <span>Description</span>
          <textarea
            rows={4}
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder="Short plain-language description"
          />
        </label>
      </div>

      {error ? <p className="checkout-error">{error}</p> : null}

      <div className="admin-form-actions">
        <button className="primary-pill" disabled={saving} type="submit">
          {saving ? "Adding..." : "Add product"}
        </button>
      </div>
    </form>
  );
}
