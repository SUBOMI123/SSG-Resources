import Link from "next/link";

import { listCatalogProducts } from "@/lib/catalog";

const PROMO_BANNERS = [
  {
    title: "Roll materials ready for site delivery",
    copy: "Check current stock, compare thickness options, and send a WhatsApp-backed order without waiting for manual price confirmation.",
    href: "/products?q=roll",
    image:
      "https://images.pexels.com/photos/10284048/pexels-photo-10284048.jpeg?cs=srgb&dl=pexels-lucas-menendez-2946471-10284048.jpg&fm=jpg",
  },
  {
    title: "Warehouse stock you can inspect before ordering",
    copy: "The storefront now works like a real supply counter: browse, confirm, and move straight into order handoff.",
    href: "/products",
    image:
      "https://images.pexels.com/photos/5484741/pexels-photo-5484741.jpeg?cs=srgb&dl=pexels-mike-van-schoonderwalt-1884800-5484741.jpg&fm=jpg",
  },
  {
    title: "Built for recurring project replenishment",
    copy: "Use the live catalog when site work, waterproofing, or bulk material restock needs to move quickly.",
    href: "/products?q=primer",
    image:
      "https://images.pexels.com/photos/36878027/pexels-photo-36878027.jpeg?cs=srgb&dl=pexels-radex-29311111-36878027.jpg&fm=jpg",
  },
] as const;

const QUICK_LINKS = [
  { label: "Plastic rolls", query: "plastic" },
  { label: "Film rolls", query: "film" },
  { label: "Primer coat", query: "primer" },
  { label: "Mineral finish", query: "mineral" },
] as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listCatalogProducts();
  const featuredProducts = products.slice(0, 6);

  return (
    <main className="shell storefront-shell">
      <section className="storefront-utility-bar">
        <div className="storefront-brand-lockup">
          <p>SSG Resources</p>
          <strong>Industrial materials and waterproofing supplies</strong>
        </div>
        <nav className="storefront-utility-links">
          <Link href="/products">Catalog</Link>
          <Link href="/checkout?product=primer&quantity=1">Quick order</Link>
          <Link href="/admin/login">Admin sign in</Link>
        </nav>
      </section>

      <section className="storefront-search-shell">
        <div className="storefront-category-chip">All products</div>
        <form action="/products" className="storefront-home-search">
          <input name="q" placeholder="Search product name, SKU, or material type" />
          <button className="storefront-search-button" type="submit">
            Search
          </button>
        </form>
        <div className="storefront-search-actions">
          <Link href="/products" className="secondary-pill">
            Browse catalog
          </Link>
        </div>
      </section>

      <section className="storefront-feature-grid">
        <article className="storefront-primary-feature">
          <img
            alt="Industrial material stock in a warehouse"
            className="storefront-feature-image"
            src={PROMO_BANNERS[0].image}
          />
          <div className="storefront-feature-overlay">
            <p className="eyebrow">Live stock and direct ordering</p>
            <h1 className="storefront-main-title">The materials you need, with a faster path to order.</h1>
            <p>
              Search the live catalog, confirm stock before you call, and move from product view to
              WhatsApp-backed order confirmation in one flow.
            </p>
            <div className="hero-actions">
              <Link href="/products" className="primary-pill">
                Shop products
              </Link>
              <Link href="#featured-products" className="secondary-pill">
                See popular items
              </Link>
            </div>
          </div>
        </article>

        <aside className="storefront-side-panel">
          <div className="storefront-side-card card">
            <p className="eyebrow">Why this works</p>
            <div className="hero-highlights">
              <div>
                <strong>Live availability</strong>
                <span>Stock shown online reflects the same numbers the team uses inside admin.</span>
              </div>
              <div>
                <strong>WhatsApp handoff</strong>
                <span>Customers can send a saved order straight to the team for payment confirmation.</span>
              </div>
              <div>
                <strong>Order tracking</strong>
                <span>Every request keeps a reference for follow-up, payment, and delivery.</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="storefront-promo-grid">
        {PROMO_BANNERS.map((banner) => (
          <Link key={banner.title} href={banner.href} className="storefront-promo-card">
            <img alt={banner.title} className="storefront-promo-image" src={banner.image} />
            <div className="storefront-promo-copy">
              <strong>{banner.title}</strong>
              <span>{banner.copy}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="card storefront-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Shop by material line</p>
            <h2 className="section-title storefront-section-title">Start with the product type you know</h2>
          </div>
          <Link href="/products" className="text-link">
            View all products
          </Link>
        </div>

        <div className="storefront-category-grid">
          {QUICK_LINKS.map((item) => (
            <Link key={item.label} href={`/products?q=${encodeURIComponent(item.query)}`} className="storefront-category-card">
              <strong>{item.label}</strong>
              <span>Open matching stock lines</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card storefront-section" id="featured-products">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured stock</p>
            <h2 className="section-title storefront-section-title">Ready-to-order materials</h2>
          </div>
          <Link href="/products" className="text-link">
            Open full catalog
          </Link>
        </div>

        <div className="catalog-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className="card catalog-card storefront-rich-card">
              <div className="catalog-topline">
                <span className="catalog-sku">{product.sku}</span>
                <span className={product.isInStock ? "stock-badge in-stock" : "stock-badge out-stock"}>
                  {product.isInStock ? `${product.available} available` : "Out of stock"}
                </span>
              </div>
              <div className="catalog-copy">
                <h2>{product.name}</h2>
                <p>{product.description ?? "Professional-grade supply for recurring project work."}</p>
              </div>
              <div className="catalog-footer">
                <strong>₦{product.unit_price.toLocaleString()}</strong>
                <Link href={`/products/${product.slug}`} className="primary-pill">
                  View product
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card storefront-section" id="how-it-works">
        <div className="section-head">
          <div>
            <p className="eyebrow">How ordering works</p>
            <h2 className="section-title storefront-section-title">A straightforward buying flow for customers and site teams</h2>
          </div>
        </div>

        <div className="marketing-grid">
          <article>
            <h3>1. Search the catalog</h3>
            <p>Start with material name, SKU, or the product line you already know.</p>
          </article>
          <article>
            <h3>2. Save the order</h3>
            <p>Enter contact and delivery details so the order is recorded properly in the system.</p>
          </article>
          <article>
            <h3>3. Confirm on WhatsApp</h3>
            <p>Send the saved order to the team on WhatsApp to confirm payment and processing.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
