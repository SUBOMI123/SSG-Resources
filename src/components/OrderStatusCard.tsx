import type { FulfillmentStatus, PaymentStatus } from "@/types/order";

interface OrderStatusCardProps {
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
}

export function OrderStatusCard({
  payment_status,
  fulfillment_status,
}: OrderStatusCardProps) {
  const paymentLabel =
    payment_status === "PENDING"
      ? "Waiting"
      : payment_status === "PARTIAL"
        ? "Part paid"
        : payment_status === "PAID"
          ? "Paid"
          : "Problem";
  const fulfillmentLabel =
    fulfillment_status === "PENDING"
      ? "New"
      : fulfillment_status === "CONFIRMED"
        ? "Confirmed"
        : "Delivered";

  return (
    <section className="card order-status-card">
      <p className="eyebrow">Order status</p>
      <div className="status-grid">
        <div>
          <span>Payment</span>
          <strong>{paymentLabel}</strong>
        </div>
        <div>
          <span>Fulfillment</span>
          <strong>{fulfillmentLabel}</strong>
        </div>
      </div>
    </section>
  );
}
