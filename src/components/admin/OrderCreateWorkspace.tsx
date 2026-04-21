"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ManualOrderParser } from "@/components/ManualOrderParser";
import type { InventoryItem } from "@/types/inventory";
import type { CheckoutLineInput, ManualOrderProductOption } from "@/types/order";

type CustomerDraft = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes: string;
  assigned_to: string;
};

const EMPTY_CUSTOMER_DRAFT: CustomerDraft = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  delivery_address: "",
  notes: "",
  assigned_to: "",
};

export function OrderCreateWorkspace() {
  const router = useRouter();
  const [products, setProducts] = useState<ManualOrderProductOption[]>([]);
  const [manualItems, setManualItems] = useState<CheckoutLineInput[]>([{ product_slug: "", quantity: 1 }]);
  const [customerDraft, setCustomerDraft] = useState<CustomerDraft>(EMPTY_CUSTOMER_DRAFT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/inventory", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load product options.");
        }

        const data = (await response.json()) as { items: InventoryItem[] };
        const mapped = data.items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          available: item.available,
        }));
        setProducts(mapped);
        setManualItems((current) =>
          current.map((line, index) =>
            index === 0 && !line.product_slug && mapped[0]
              ? { ...line, product_slug: mapped[0].slug }
              : line,
          ),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load product options.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  function updateManualItem(index: number, next: CheckoutLineInput) {
    setManualItems((current) => current.map((line, lineIndex) => (lineIndex === index ? next : line)));
  }

  function addManualItem() {
    setManualItems((current) => [...current, { product_slug: products[0]?.slug ?? "", quantity: 1 }]);
  }

  function removeManualItem(index: number) {
    setManualItems((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function applyParsedItems(items: CheckoutLineInput[], rawText: string) {
    setManualItems(items.length > 0 ? items : [{ product_slug: products[0]?.slug ?? "", quantity: 1 }]);
    setCustomerDraft((current) => ({
      ...current,
      notes: current.notes.trim()
        ? `${current.notes.trim()}\n\nParsed from raw text:\n${rawText.trim()}`
        : `Parsed from raw text:\n${rawText.trim()}`,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const items = manualItems.filter((line) => line.product_slug && line.quantity > 0);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...customerDraft,
          items,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string; order?: { id?: string } };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to create order.");
      }

      router.push("/admin/orders/list");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-create-layout">
      <ManualOrderParser products={products} onApply={applyParsedItems} />

      <form className="admin-form-shell admin-panel" onSubmit={handleSubmit}>
        <div className="admin-panel-head">
          <div>
          <p className="eyebrow">Create order</p>
          <h2 className="admin-section-title">Add a manual order</h2>
          <p className="admin-muted-copy">
            Fill in the customer details, choose the products, and save the order. Use the parser first if the request came as raw text.
          </p>
          </div>
        </div>

        <div className="form-grid">
          <label className="checkout-field">
            <span>Customer name</span>
            <input
              name="customer_name"
              required
              value={customerDraft.customer_name}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, customer_name: event.target.value }))}
            />
          </label>
          <label className="checkout-field">
            <span>Email address</span>
            <input
              name="customer_email"
              required
              type="email"
              value={customerDraft.customer_email}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, customer_email: event.target.value }))}
            />
          </label>
          <label className="checkout-field">
            <span>Phone number</span>
            <input
              name="customer_phone"
              required
              value={customerDraft.customer_phone}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, customer_phone: event.target.value }))}
            />
          </label>
          <label className="checkout-field">
            <span>Handled by</span>
            <input
              name="assigned_to"
              placeholder="Name of the person following up"
              value={customerDraft.assigned_to}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, assigned_to: event.target.value }))}
            />
          </label>
          <label className="checkout-field checkout-field-wide">
            <span>Delivery address</span>
            <textarea
              name="delivery_address"
              required
              rows={3}
              value={customerDraft.delivery_address}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, delivery_address: event.target.value }))}
            />
          </label>

          <div className="checkout-field checkout-field-wide">
            <span>Items in this order</span>
            <div className="manual-items">
              {manualItems.map((line, index) => {
                const selectedProduct = products.find((product) => product.slug === line.product_slug) ?? null;

                return (
                  <div key={`${line.product_slug}-${index}`} className="manual-item-row">
                    <label className="checkout-field">
                      <span>Product</span>
                      <select
                        value={line.product_slug}
                        onChange={(event) =>
                          updateManualItem(index, {
                            ...line,
                            product_slug: event.target.value,
                          })
                        }
                      >
                        {products.map((product) => (
                          <option key={product.slug} value={product.slug}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="checkout-field">
                      <span>Quantity</span>
                      <input
                        min={1}
                        type="number"
                        value={String(line.quantity)}
                        onChange={(event) =>
                          updateManualItem(index, {
                            ...line,
                            quantity: Math.max(Number(event.target.value || "1"), 1),
                          })
                        }
                      />
                    </label>

                    <div className="manual-item-meta">
                      <span>Available: {selectedProduct?.available ?? 0}</span>
                      <button
                        className="secondary-pill"
                        disabled={manualItems.length === 1}
                        onClick={() => removeManualItem(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="checkout-actions">
              <button className="secondary-pill" onClick={addManualItem} type="button">
                Add product line
              </button>
            </div>
          </div>

          <label className="checkout-field checkout-field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              rows={5}
              placeholder="Phone-call notes, delivery context, or follow-up details."
              value={customerDraft.notes}
              onChange={(event) => setCustomerDraft((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
        </div>

        {loading ? <p className="admin-muted-copy">Loading products...</p> : null}
        {error ? <p className="checkout-error">{error}</p> : null}

        <div className="admin-form-actions">
          <button className="primary-pill" disabled={saving || loading} type="submit">
            {saving ? "Adding..." : "Save order"}
          </button>
        </div>
      </form>
    </div>
  );
}
