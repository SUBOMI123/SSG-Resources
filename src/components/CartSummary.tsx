import type { CatalogProductDetail } from "@/types/catalog";

interface CartSummaryProps {
  product: CatalogProductDetail;
  quantity: number;
}

export function CartSummary({ product, quantity }: CartSummaryProps) {
  const total = product.unit_price * quantity;

  return (
    <section className="card checkout-summary">
      <p className="eyebrow">Cart summary</p>
      <div className="summary-line">
        <div>
          <strong>{product.name}</strong>
          <p>{product.description ?? "Selected from the live storefront catalog."}</p>
        </div>
        <span>{product.sku}</span>
      </div>

      <div className="summary-breakdown">
        <div>
          <span>Unit price</span>
          <strong>₦{product.unit_price.toLocaleString()}</strong>
        </div>
        <div>
          <span>Quantity</span>
          <strong>{quantity}</strong>
        </div>
        <div>
          <span>Available now</span>
          <strong>{product.available}</strong>
        </div>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <strong>₦{total.toLocaleString()}</strong>
      </div>
    </section>
  );
}
