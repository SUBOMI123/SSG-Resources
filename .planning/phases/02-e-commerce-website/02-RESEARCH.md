# Phase 2: E-Commerce Website - Research

**Researched:** April 19, 2026
**Status:** Ready for planning

## Objective

Research what Phase 2 needs in order to plan a customer-facing website on top of the completed inventory foundation.

## Key Findings

### Storefront Architecture
- The existing Next.js 15 app router is sufficient for the public website and checkout flow. There is no need to split storefront and admin into separate applications at this stage.
- Server-rendered catalog pages are a good fit for product browsing because they keep SEO and perceived trust strong without adding client-side state complexity everywhere.
- Checkout should remain dynamic and revalidate inventory on the server before payment initialization.

### Data and Domain Modeling
- Phase 1 already provides the essential product inventory source of truth: SKU, description, price, on-hand, reserved, and available.
- Phase 2 needs an order model and a checkout/payment reference model before Phase 3’s broader order management work. These can start small: customer details, items snapshot, total, status, and Paystack reference.
- Inventory reservation must happen atomically when an order is created or prepared for payment to avoid overselling.

### Payment Integration
- Paystack integration should use server-side initialization and verification rather than trusting client-only payment responses.
- Webhook/callback verification must be idempotent because payment providers can retry or deliver events out of order.
- Payment status and order status should be related but not identical. A failed or abandoned payment should not appear as a confirmed paid order.

### UX Direction
- The current codebase already has a warm editorial visual language in `globals.css`; Phase 2 should extend it for public pages instead of switching directions.
- Catalog browsing should prioritize clarity: image slot, SKU/name, price, stock hint, and quantity selection.
- Mobile usability matters more than animation complexity. Fast access to products, cart summary, and payment CTA should guide the layout.

## Reusable Existing Assets

- `src/lib/inventory.ts` can power public inventory reads and reservation behavior.
- `src/app/layout.tsx` and `src/app/globals.css` provide the current shell and tokens for the storefront.
- `src/app/api/inventory/*` establishes the route/service separation pattern to follow for orders and checkout.

## Risks to Plan Around

1. Inventory and payment can drift if stock is reserved too late or released incorrectly after failed checkout.
2. Guest checkout adds customer input risk, so strong server-side validation is needed on checkout fields.
3. Public catalog pages can accidentally leak admin-oriented data if product queries are reused carelessly.
4. Phase 2 can sprawl into full order management if plan boundaries are not enforced.

## Planning Implications

- Split the phase into: storefront foundation, checkout/order creation, payment integration, and post-payment confirmation/tracking.
- Put product browsing first so the public website becomes visible early.
- Isolate Paystack integration into its own plan so payment concerns stay testable and contained.
- Ensure the final plan adds just enough order persistence for customer confirmation and tracking, while leaving internal fulfillment complexity for Phase 3.

---

*Phase: 02-e-commerce-website*
*Research completed: April 19, 2026*
