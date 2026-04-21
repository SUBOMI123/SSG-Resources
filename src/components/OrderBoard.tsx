"use client";

import Link from "next/link";

import { OrderStatusEditor } from "@/components/OrderStatusEditor";
import type { AdminOrderListItem, FulfillmentStatus, PaymentStatus } from "@/types/order";

interface OrderBoardProps {
  orders: AdminOrderListItem[];
  onRefresh: () => Promise<void>;
}

const COLUMNS: FulfillmentStatus[] = ["PENDING", "CONFIRMED", "DELIVERED"];

function orderStageLabel(value: FulfillmentStatus) {
  if (value === "PENDING") return "New";
  if (value === "CONFIRMED") return "Confirmed";
  return "Delivered";
}

function paymentLabel(value: PaymentStatus) {
  if (value === "PENDING") return "Waiting for payment";
  if (value === "PAID") return "Paid";
  return "Payment problem";
}

export function OrderBoard({ orders, onRefresh }: OrderBoardProps) {
  return (
    <div className="order-board">
      {COLUMNS.map((column) => {
        const columnOrders = orders.filter((order) => order.fulfillment_status === column);

        return (
          <section key={column} className="card order-lane">
            <div className="order-lane-head">
              <div>
                <p className="eyebrow">{orderStageLabel(column)}</p>
                <strong>{columnOrders.length} order(s)</strong>
                <p className="order-lane-copy">
                  {column === "PENDING"
                    ? "Fresh orders that still need action."
                    : column === "CONFIRMED"
                      ? "Orders being processed now."
                      : "Orders already delivered."}
                </p>
              </div>
            </div>

            <div className="order-lane-body">
              {columnOrders.map((order) => (
                <article key={order.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <strong>{order.reference}</strong>
                      <div className="order-meta">
                        {order.customer_name} · {order.source === "WEB" ? "Website" : "Added here"}
                      </div>
                    </div>
                    <strong>₦{order.total.toLocaleString()}</strong>
                  </div>

                  <div className="order-status-strip">
                    <span className={`order-status-pill ${order.payment_status === "PAID" ? "order-status-paid" : order.payment_status === "FAILED" ? "order-status-problem" : "order-status-waiting"}`}>
                      {paymentLabel(order.payment_status)}
                    </span>
                    <span className="order-status-pill order-status-stage">
                      {orderStageLabel(order.fulfillment_status)}
                    </span>
                  </div>

                  <div className="order-card-lines">
                    {order.items.map((item) => (
                      <div key={`${order.reference}-${item.product_slug}`}>
                        {item.product_name} x {item.quantity}
                      </div>
                    ))}
                  </div>

                  <div className="order-card-summary">
                    <div>
                      <span>Handled by</span>
                      <strong>{order.assigned_to || "Not set yet"}</strong>
                    </div>
                    <div>
                      <span>Customer phone</span>
                      <strong>{order.customer_phone}</strong>
                    </div>
                  </div>

                  <div className="order-doc-links">
                    <Link href={`/documents/invoice/${order.reference}`} target="_blank">
                      Invoice
                    </Link>
                    <Link href={`/documents/waybill/${order.reference}`} target="_blank">
                      Waybill
                    </Link>
                    <Link href={`/orders/${order.reference}`} target="_blank">
                      Tracking
                    </Link>
                  </div>

                  <OrderStatusEditor order={order} onSaved={onRefresh} />
                </article>
              ))}

              {columnOrders.length === 0 ? (
                <p className="order-empty">No orders in this stage.</p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
