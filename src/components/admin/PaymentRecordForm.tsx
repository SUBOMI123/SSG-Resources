"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderOption = {
  id: string;
  reference: string;
  customer_name: string;
  balance_due: number;
};

interface PaymentRecordFormProps {
  orders: OrderOption[];
}

export function PaymentRecordForm({ orders }: PaymentRecordFormProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = orders.find((order) => order.id === orderId) ?? null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const nextAmount = Number(amount);
    if (!selectedOrder) {
      setError("Choose an order first.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: nextAmount,
          note,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to record payment.");
      }

      router.push(`/admin/payments/${selectedOrder.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form-shell admin-panel" onSubmit={handleSubmit}>
      <div className="admin-panel-head">
        <div>
          <p className="eyebrow">Record payment</p>
          <h2 className="admin-section-title">Capture money received</h2>
          <p className="admin-muted-copy">
            Choose an order with a balance left, enter the amount received, and save it to update the remaining balance automatically.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="checkout-field checkout-field-wide">
          <span>Order</span>
          <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.reference} - {order.customer_name} (Balance ₦{order.balance_due.toLocaleString()})
              </option>
            ))}
          </select>
        </label>
        <label className="checkout-field">
          <span>Amount received</span>
          <input min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label className="checkout-field">
          <span>Note</span>
          <input placeholder="Transfer, cash, part payment" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      {selectedOrder ? (
        <div className="admin-inline-note">
          <strong>Balance left:</strong> ₦{selectedOrder.balance_due.toLocaleString()}
        </div>
      ) : null}
      {error ? <p className="checkout-error">{error}</p> : null}

      <div className="admin-form-actions">
        <button className="primary-pill" disabled={saving || orders.length === 0} type="submit">
          {saving ? "Saving..." : "Record payment"}
        </button>
      </div>
    </form>
  );
}
