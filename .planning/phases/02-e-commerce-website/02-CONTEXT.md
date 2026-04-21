# Phase 2: E-Commerce Website - Context

**Gathered:** April 19, 2026
**Status:** Ready for planning

## Phase Boundary

Phase 2 delivers the public-facing commerce experience for customers. It adds a browseable product catalog, a guided checkout flow, Paystack payment handling, and customer-visible order confirmation/tracking without expanding into admin-heavy order operations that belong to Phase 3.

**What this phase delivers:**
- Public website with business positioning and product catalog
- Product detail and quantity selection for online ordering
- Checkout flow that creates web orders and hands payment to Paystack
- Customer confirmation and lightweight order-status lookup

**Requirements covered:** WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, WEB-06

## Implementation Decisions

### Storefront Structure
- **D-01:** Use the existing Next.js app router to serve both the marketing homepage and the commerce catalog instead of splitting into a separate frontend.
- **D-02:** Keep the public website simple and trustworthy: homepage, product catalog, product detail/selection, checkout, confirmation, and order-tracking pages.
- **D-03:** Use the Phase 1 `Product` inventory data as the single source of truth for catalog availability and pricing.

### Customer Ordering Flow
- **D-04:** Checkout is guest-first for v1. Customers place orders with contact details and delivery information without requiring account creation.
- **D-05:** Product selection should happen on the public site with quantity controls and validation against available inventory.
- **D-06:** Inventory must be reserved immediately when a valid web order is created so the storefront cannot sell unavailable stock.

### Payment and Order Visibility
- **D-07:** Paystack is the only payment provider in scope for this phase.
- **D-08:** Payment flow should use a server-side initialization step and a verification callback/webhook path before an order is treated as paid.
- **D-09:** Customers should receive a clear confirmation page after successful payment and a simple order-tracking page keyed by order reference.

### Presentation and UX
- **D-10:** Reuse the project’s current editorial, warm-toned visual direction so the public site feels consistent with the existing admin shell rather than introducing a new design system.
- **D-11:** Mobile use is first-class: browsing, cart review, and checkout must remain usable on phones.
- **D-12:** Real-time behavior is not required on the storefront; data freshness through dynamic server rendering and checkout-time validation is sufficient.

### Codex's Discretion
- Exact component breakdown for storefront UI
- Whether cart state is URL/session/local-storage backed
- Form validation library choices and API payload structure
- Paystack integration details such as callback route organization and webhook hardening

## Specific Ideas

- Product listing should feel professional and easy to scan, closer to a polished catalog than a generic dashboard.
- Order tracking should stay lightweight for v1: reference lookup and status display, not full customer accounts.
- Empty and out-of-stock states should guide customers toward available products instead of dead ends.

## Canonical References

### Project Scope
- `.planning/ROADMAP.md` — Defines the fixed scope and success criteria for Phase 2
- `.planning/REQUIREMENTS.md` — Source requirements for WEB-01 through WEB-06
- `.planning/PROJECT.md` — Business context, payment choice, and project constraints

### Prior Phase Decisions
- `.planning/phases/01-inventory-tracking/01-CONTEXT.md` — Inventory consistency and reservation expectations that storefront ordering must respect
- `.planning/phases/01-inventory-tracking/01-02-PLAN.md` — Existing inventory API/business-logic conventions

### Research
- `.planning/research/STACK.md` — Next.js, Prisma, PostgreSQL, and Tailwind recommendations
- `.planning/research/ARCHITECTURE.md` — Layered architecture and domain/service boundaries
- `.planning/research/PITFALLS.md` — Inventory consistency, payment, and concurrency risks

## Existing Code Insights

### Reusable Assets
- `src/lib/db.ts` — Prisma client configured for Prisma 7 + PostgreSQL adapter
- `src/lib/inventory.ts` — Inventory list and reservation primitives that storefront ordering should build on
- `src/types/inventory.ts` — Product/inventory typing patterns to mirror for storefront/order contracts
- `src/app/layout.tsx` and `src/app/globals.css` — Established application shell and visual tokens

### Established Patterns
- API logic lives in `src/app/api/.../route.ts`
- Business logic sits in `src/lib/*` rather than inside route handlers
- The project is already using App Router pages and server rendering successfully

### Integration Points
- Public catalog can read directly from the Phase 1 `Product` table
- Checkout/order creation must connect to the same inventory reservation logic from Phase 1
- Payment verification will need an order persistence layer that Phase 3 can later extend

## Deferred Ideas

- Customer accounts and saved profiles — separate capability beyond this phase
- Multi-step shipping workflows and admin fulfillment tooling — Phase 3
- Advanced promotions, discounts, and coupon logic — future phase
- Multiple payment gateways beyond Paystack — out of scope

---

*Phase: 02-e-commerce-website*
*Context gathered: April 19, 2026*
