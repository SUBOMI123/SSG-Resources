import Link from "next/link";

import { listCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const products = await listCatalogProducts(query);

  return (
    <main className="shell storefront-shell">
      <div className="storefront-breadcrumbs">
        <Link href="/" className="text-link">
          Back to home
        </Link>
        <span>/</span>
        <span>{query ? "Search results" : "Catalog"}</span>
      </div>

      <section className="section-head">
        <div>
          <p className="eyebrow">Storefront</p>
          <h1 className="section-title">{query ? `Search results for "${query}"` : "Browse available products"}</h1>
        </div>
        <p className="section-copy">
          Pricing and availability come from the live inventory system, so what customers see here
          matches the current stock position.
        </p>
      </section>

      <section className="card storefront-toolbar">
        <form action="/products" className="storefront-search-form">
          <input defaultValue={query} name="q" placeholder="Search by product name, SKU, or material" />
          <button className="primary-pill" type="submit">
            Search catalog
          </button>
        </form>
      </section>

      {products.length === 0 ? (
        <section className="card storefront-empty">
          <strong>No products matched that search.</strong>
          <p>Try a different material name, SKU, or broader search term.</p>
        </section>
      ) : (
        <section className="catalog-grid">
          {products.map((product) => (
            <article key={product.id} className="card catalog-card">
              <div className="catalog-topline">
                <span className="catalog-sku">{product.sku}</span>
                <span className={product.isInStock ? "stock-badge in-stock" : "stock-badge out-stock"}>
                  {product.isInStock ? `${product.available} available` : "Out of stock"}
                </span>
              </div>
              <div className="catalog-copy">
                <h2>{product.name}</h2>
                <p>{product.description ?? "Professional-grade supply for ongoing project work."}</p>
              </div>
              <div className="catalog-footer">
                <strong>₦{product.unit_price.toLocaleString()}</strong>
                <Link href={`/products/${product.slug}`} className="primary-pill">
                  View product
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
