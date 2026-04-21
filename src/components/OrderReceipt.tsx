import type { OrderPublicSummary } from "@/types/order";

interface OrderReceiptProps {
  order: OrderPublicSummary;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  return (
    <section className="card order-receipt">
      <p className="eyebrow">Order receipt</p>
      <div className="receipt-head">
        <div>
          <strong>{order.customer_name}</strong>
          <p>{order.customer_email}</p>
          <p>{order.customer_phone}</p>
        </div>
        <div>
          <strong>{order.reference}</strong>
          <p>{new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="receipt-address">
        <span>Delivery address</span>
        <p>{order.delivery_address}</p>
      </div>

      <div className="receipt-lines">
        {order.items.map((item) => (
          <div key={`${order.reference}-${item.product_slug}`}>
            <span>
              {item.product_name} x {item.quantity}
            </span>
            <strong>₦{item.line_total.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <div className="summary-total">
        <span>Total</span>
        <strong>₦{order.total.toLocaleString()}</strong>
      </div>
    </section>
  );
}
