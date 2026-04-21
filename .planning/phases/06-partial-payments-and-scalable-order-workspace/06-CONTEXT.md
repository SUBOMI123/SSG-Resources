# Phase 06 Context: Partial Payments and Scalable Order Workspace

## Goal

Make the admin workflow usable for a growing, non-technical business team by supporting partial payments and replacing the card-heavy order board with a filterable workspace that scales to longer order lists.

## Why This Phase Exists

The earlier order workflow assumed a simple paid or not-paid state and a small number of active orders. That created two operational gaps:

- the business cannot track half payments, installment payments, or remaining balances inside the app
- the card-based order board becomes difficult to scan once the number of orders grows

This phase closes both gaps so the system can support real day-to-day follow-up as the business transitions from manual tracking into a structured digital workflow.

## Initial Scope

- Add partial-payment support to the data model
- Store payment history per order
- Let admin record more than one payment against the same order
- Show amount paid and balance left across orders, payments, finance, and invoice views
- Replace the card wall on the main orders screen with a searchable, filterable list plus selected-order detail panel

## Explicitly Deferred

- Live Paystack verification still depends on keys and remains deferred from Phase 2
- Broader analytics, exports, and customer statements are outside this phase
- Bulk order actions are still out of scope for now
