"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { InventoryForm } from "@/components/InventoryForm";
import type { InventoryItem } from "@/types/inventory";

interface InventoryDetailActionsProps {
  item: InventoryItem;
}

export function InventoryDetailActions({ item }: InventoryDetailActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(quantity: number) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_quantity: quantity,
          reason: "MANUAL_UPDATE",
          changed_by: "admin-dashboard",
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to update inventory.");
      }

      setEditing(false);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update inventory.");
      throw submitError;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Remove ${item.name}? This only works if the product is not already tied to orders or reserved stock.`,
    );
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to remove product.");
      }

      router.push("/admin/inventory/list");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to remove product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="admin-detail-actions">
        <button className="primary-pill" onClick={() => setEditing(true)} type="button">
          Update quantity
        </button>
        <button className="danger-pill" onClick={handleDelete} disabled={saving} type="button">
          Remove product
        </button>
      </div>
      {error ? <p className="checkout-error">{error}</p> : null}
      <InventoryForm
        item={editing ? item : null}
        loading={saving}
        onCancel={() => setEditing(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
