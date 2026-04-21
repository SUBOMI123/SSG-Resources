"use client";

import { useEffect, useState } from "react";

import type { AdminOrderListItem, FulfillmentStatus, PaymentStatus } from "@/types/order";

interface OrderStatusEditorProps {
  order: AdminOrderListItem;
  onSaved: (action?: "saved" | "deleted") => Promise<void> | void;
}

const FULFILLMENT_OPTIONS: FulfillmentStatus[] = ["PENDING", "CONFIRMED", "DELIVERED"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "FAILED"];

function orderStageLabel(value: FulfillmentStatus) {
  if (value === "PENDING") return "New";
  if (value === "CONFIRMED") return "Confirmed";
  return "Delivered";
}

function paymentLabel(value: PaymentStatus) {
  if (value === "PENDING") return "Waiting";
  if (value === "PARTIAL") return "Part paid";
  if (value === "PAID") return "Paid";
  return "Problem";
}

export function OrderStatusEditor({ order, onSaved }: OrderStatusEditorProps) {
  const [assignedTo, setAssignedTo] = useState(order.assigned_to ?? "");
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillment_status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAssignedTo(order.assigned_to ?? "");
    setFulfillmentStatus(order.fulfillment_status);
    setPaymentStatus(order.payment_status);
    setError(null);
  }, [order]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned_to: assignedTo.trim() || null,
          fulfillment_status: fulfillmentStatus,
          payment_status: paymentStatus,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to update order.");
      }

      await onSaved("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRecordPayment() {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          note: paymentNote,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to record payment.");
      }

      setPaymentAmount("");
      setPaymentNote("");
      await onSaved("saved");
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Remove order ${order.reference}? This will also release any stock held for it.`,
    );
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Failed to remove order.");
      }

      await onSaved("deleted");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to remove order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="order-status-editor">
      <div className="selected-order-payments">
        <p className="eyebrow">Record payment</p>
        <div className="payment-record-grid">
          <label className="checkout-field">
            <span>Amount received</span>
            <input
              min="0"
              step="0.01"
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
            />
          </label>
          <label className="checkout-field">
            <span>Note</span>
            <input
              placeholder="Transfer, cash, part payment"
              value={paymentNote}
              onChange={(event) => setPaymentNote(event.target.value)}
            />
          </label>
        </div>
        <p className="order-editor-note">
          Record each payment as it happens. The balance and payment status update automatically.
        </p>
        <div className="checkout-actions">
          <button className="primary-pill" disabled={saving || order.balance_due === 0} onClick={handleRecordPayment} type="button">
            {saving ? "Saving..." : order.balance_due === 0 ? "Fully paid" : "Record payment"}
          </button>
        </div>
      </div>

      <label className="checkout-field">
        <span>Handled by</span>
        <input
          placeholder="Name of the person following up"
          value={assignedTo}
          onChange={(event) => setAssignedTo(event.target.value)}
        />
      </label>
      <label className="checkout-field">
        <span>Order stage</span>
        <select
          value={fulfillmentStatus}
          onChange={(event) => setFulfillmentStatus(event.target.value as FulfillmentStatus)}
        >
          {FULFILLMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {orderStageLabel(option)}
            </option>
          ))}
        </select>
      </label>
      <label className="checkout-field">
        <span>Payment status</span>
        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
        >
          {PAYMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {paymentLabel(option)}
            </option>
          ))}
        </select>
      </label>
      <p className="order-editor-note">
        Use <strong>Waiting</strong> when no money has come in, <strong>Part paid</strong> when some has been received, and <strong>Paid</strong> only when the balance is zero.
      </p>
      <div className="checkout-actions">
        <button className="secondary-pill" disabled={saving} onClick={handleSave} type="button">
          {saving ? "Saving..." : "Save order details"}
        </button>
        <button className="danger-pill" disabled={saving} onClick={handleDelete} type="button">
          Remove order
        </button>
      </div>
      {error ? <p className="checkout-error">{error}</p> : null}
    </div>
  );
}
