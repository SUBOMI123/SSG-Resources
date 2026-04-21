import Link from "next/link";
import { notFound } from "next/navigation";

import { CartSummary } from "@/components/CartSummary";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getCatalogProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<{
    product?: string;
    quantity?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const slug = params.product;
  const quantity = Math.max(Number(params.quantity ?? "1"), 1);

  if (!slug) {
    notFound();
  }

  const product = await getCatalogProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <main className="shell storefront-shell">
      <div className="section-head">
        <div>
          <p className="eyebrow">Guest checkout</p>
          <h1 className="section-title">Send your order details</h1>
        </div>
        <Link href={`/products/${product.slug}`} className="text-link">
          Back to product
        </Link>
      </div>

      <div className="checkout-layout">
        <CartSummary product={product} quantity={quantity} />
        <CheckoutForm product={product} quantity={quantity} />
      </div>
    </main>
  );
}
