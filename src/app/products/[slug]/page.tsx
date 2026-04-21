import Link from "next/link";
import { notFound } from "next/navigation";

import { getCatalogProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="shell storefront-shell">
      <Link href="/products" className="text-link">
        Back to catalog
      </Link>

      <section className="card product-detail-shell">
        <div className="product-detail-copy">
          <p className="eyebrow">{product.sku}</p>
          <h1 className="section-title">{product.name}</h1>
          <p className="section-copy">
            {product.description ?? "Reliable stock for recurring jobs, installations, and replenishment needs."}
          </p>

          <div className="detail-stats">
            <div>
              <span>Unit price</span>
              <strong>₦{product.unit_price.toLocaleString()}</strong>
            </div>
            <div>
              <span>Available now</span>
              <strong>{product.available}</strong>
            </div>
            <div>
              <span>Reserved</span>
              <strong>{product.reserved}</strong>
            </div>
          </div>
        </div>

        <aside className="card product-buy-panel">
          <p className="eyebrow">Order setup</p>
          <div className="buy-panel-copy">
            <strong>{product.available > 0 ? "Ready to order" : "Currently unavailable"}</strong>
            <p>
              Choose the quantity you need and move into checkout. The order will be saved first, then
              you will confirm payment with the team on WhatsApp.
            </p>
          </div>

          {product.available > 0 ? (
            <form action="/checkout" method="get" className="buy-panel-form">
              <input type="hidden" name="product" value={product.slug} />
              <label className="quantity-field">
                <span>Requested quantity</span>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={Math.max(product.available, 1)}
                  defaultValue="1"
                />
              </label>
              <div className="buy-panel-actions">
                <Link href="/products" className="secondary-pill">
                  Continue browsing
                </Link>
                <button type="submit" className="primary-pill">
                  Order on WhatsApp
                </button>
              </div>
            </form>
          ) : (
            <div className="buy-panel-actions">
              <Link href="/products" className="secondary-pill">
                Continue browsing
              </Link>
              <span className="stock-note">
                This product will stay hidden from checkout until stock returns.
              </span>
            </div>
          )}

          <span className="stock-note">
            {product.available > 0
              ? "Checkout saves a pending order and reserves stock before the team confirms payment on WhatsApp."
              : "Out-of-stock products cannot proceed to checkout."}
          </span>
        </aside>
      </section>
    </main>
  );
}
