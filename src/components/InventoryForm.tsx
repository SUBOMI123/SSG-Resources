"use client";

import { useEffect, useState } from "react";

import type { InventoryItem } from "@/types/inventory";

interface InventoryFormProps {
  item: InventoryItem | null;
  onSubmit: (quantity: number) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function InventoryForm({ item, onSubmit, onCancel, loading }: InventoryFormProps) {
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantity(item ? String(item.quantity_on_hand) : "");
    setError("");
  }, [item]);

  if (!item) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      setError("Quantity must be a whole number greater than or equal to zero.");
      return;
    }

    try {
      await onSubmit(nextQuantity);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update stock.");
    }
  }

  return (
    <div className="inventory-modal-backdrop">
      <div className="card inventory-modal-card">
        <div className="inventory-modal-head">
          <h2>Update stock</h2>
          <p>
            {item.name} ({item.sku}) currently has {item.quantity_on_hand} units on hand and{" "}
            {item.reserved} reserved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="inventory-modal-form">
          <label className="inventory-modal-field">
            <span>New quantity on hand</span>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={loading}
            />
          </label>

          {error ? <p className="inventory-error" style={{ marginBottom: 0 }}>{error}</p> : null}

          <div className="inventory-modal-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="secondary-pill"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="primary-pill"
            >
              {loading ? "Saving..." : "Save update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
