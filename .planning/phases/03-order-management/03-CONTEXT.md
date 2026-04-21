# Phase 3: Order Management - Context

**Gathered:** April 20, 2026
**Status:** Ready for planning

## Phase Boundary

Phase 3 turns the existing storefront and checkout order records into an admin-operable order
management workflow. It adds manual order entry, richer internal tracking, assignment, and
fulfillment controls for both web and manually captured orders.

**What this phase delivers:**
- Manual order entry for admin users
- Raw text parsing to prefill order items and quantities
- Internal order dashboard with assignment and status updates
- Unified handling for storefront and manually created orders

**Requirements covered:** ORD-01, ORD-02, ORD-03, ORD-04

## Implementation Decisions

### Order Capture
- **D-01:** Phase 2 `Order` and `OrderItem` remain the primary persistence layer for Phase 3 rather than introducing a separate order system.
- **D-02:** Manual orders must be creatable from the admin experience without requiring the public checkout flow.
- **D-03:** Parsed text should assist data entry, not silently create orders without admin review.

### Internal Workflow
- **D-04:** Order status management should build on the existing `PENDING` and `CONFIRMED` states and extend cleanly toward `DELIVERED` and `PAID`.
- **D-05:** Assignment belongs to internal admin workflow, not customer-visible tracking.
- **D-06:** Both web and manual orders should appear in the same management surface.

### Parsing and Validation
- **D-07:** Text parsing is best-effort and should prefill recognized products/quantities while flagging uncertain lines for manual correction.
- **D-08:** Inventory consistency rules from Phase 1 still apply; manual order actions must not bypass stock checks casually.

### Presentation and UX
- **D-09:** Order management should extend the current admin shell, not invent a separate internal app.
- **D-10:** The admin workflow should optimize for speed and clarity over decorative UI.

### Codex's Discretion
- Whether assignment uses simple free-text owner names or a more structured placeholder
- Exact parsing heuristics for pasted order text
- Internal component breakdown for the order management dashboard

## Specific Ideas

- Manual entry should feel fast for phone-call and WhatsApp-style orders.
- Admins should be able to paste messy raw order text, review the parsed result, and correct it before saving.
- Status progression should stay easy to scan at a glance.

## Canonical References

### Project Scope
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria
- `.planning/REQUIREMENTS.md` — ORD-01 through ORD-04
- `.planning/PROJECT.md` — business context for manual + web orders

### Prior Phase Decisions
- `.planning/phases/01-inventory-tracking/01-CONTEXT.md` — inventory consistency constraints
- `.planning/phases/02-e-commerce-website/02-CONTEXT.md` — storefront/order flow assumptions
- `.planning/phases/02-e-commerce-website/02-02-PLAN.md` — existing order persistence and checkout decisions

### Research
- `.planning/research/ARCHITECTURE.md` — service boundaries and admin workflow structure
- `.planning/research/PITFALLS.md` — order/inventory consistency pitfalls

## Existing Code Insights

### Reusable Assets
- `src/lib/orders.ts` — order creation and lookup baseline
- `src/app/admin/layout.tsx` — existing admin shell
- `src/lib/inventory.ts` — stock reservation/validation behavior

### Established Patterns
- Route handlers live in `src/app/api/.../route.ts`
- Business logic belongs in `src/lib/*`
- Public and admin flows can share the same persistence layer if API boundaries stay clear

### Integration Points
- Manual order entry should write into the same `Order` / `OrderItem` tables Phase 2 already established
- Admin workflow can reuse existing product and inventory data for validation
- Phase 4 invoicing/payment tracking should build on the order statuses introduced here

## Deferred Ideas

- Full user/role management for assignment ownership
- Advanced parser intelligence beyond heuristic product/quantity extraction
- Customer messaging/notifications beyond basic order tracking

---

*Phase: 03-order-management*
*Context gathered: April 20, 2026*
