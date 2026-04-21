# Phase 04 Context: Invoicing & Payments

## Goal

Turn completed order workflows into operational documents and simple financial visibility. This phase builds on the unified order model from Phase 3 and adds invoice generation, waybill generation, and payment tracking/reporting.

## Current State

- Orders already store customer details, items, totals, payment state, fulfillment state, assignment, and references.
- Admins can create orders manually, update workflow state, and parse raw text into order lines.
- Customer tracking pages already exist for order lookup.
- Paystack initialization and verification code exists, but live verification is still deferred pending keys.

## Decisions Carried Forward

- Generate documents directly from live order data rather than introducing a parallel document-entry workflow.
- Keep the first document release lightweight and printable from the browser so operators can use it immediately without extra infrastructure.
- Preserve the deferred Paystack verification reminder while continuing downstream invoicing/payment work.

## Requirements Mapping

- `INV-01`: Invoices are generated instantly from completed orders
- `INV-02`: Waybills are generated instantly from completed orders
- `INV-03`: Documents can be downloaded or printed at any time
- `PAY-01`: System tracks which orders are paid and which are outstanding
- `PAY-02`: Business can view total sales, collected payments, and outstanding balances

## Plan Order

1. `04-01` — Invoice and waybill generation
2. `04-02` — Payment tracking and reconciliation surface
3. `04-03` — Financial reporting dashboard

## Risks / Constraints

- Live payment verification still depends on Paystack keys and remains outside the critical path for this phase.
- Document content is derived from current order state; if immutable audit snapshots are needed later, that should be a follow-up enhancement.
- Browser print and Save as PDF are the current download path; dedicated PDF binaries are not required for the first release.
