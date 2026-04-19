# Digital Inventory & Order Management System

## What This Is

A simple, tailored system to help streamline your daily operations, reduce manual work, and improve accuracy — all in one place. Includes a business website with product catalog and online ordering, real-time inventory tracking, order management system, automatic invoice and waybill generation, and financial tracking with Paystack payment processing.

## Core Value

Streamline daily operations by reducing manual work and improving accuracy through integrated inventory, ordering, and payment management.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Business Website — Online product catalog with Paystack payments
- [ ] Order Management System — Manual and web order processing
- [ ] Automatic Invoice & Waybill Generation — Document automation
- [ ] Inventory Tracking — Real-time stock management
- [ ] Cash & Payment Tracking — Financial visibility

### Out of Scope

- Advanced analytics or reporting — not requested
- Multi-user role management — not specified
- Integrations with external payment gateways beyond Paystack — not mentioned
- Mobile app development — not included

## Context

Prepared exclusively for your business. Proposal dated April 19, 2026.

The business currently uses Excel spreadsheets to track orders. The system will consolidate orders from:
- Online website (with Paystack payment)
- Manual entry by admin (including pasted order text parsing)
- Track inventory, payments, and generate professional invoices/waybills

## Constraints

- **Timeline**: Not specified
- **Budget**: Not specified
- **Tech Stack**: Node.js 22.x LTS, Next.js 15.x, PostgreSQL 17.x, Prisma 7.x

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Paystack for payments | Secure payment processing for Nigerian businesses | ✓ Good |
| Manual order entry with text parsing | Supports offline orders from phone calls, emails | ✓ Good |
| Single phased approach | Start with inventory, add website, then admin tools | — Pending |

---
*Last updated: April 19, 2026 after requirements refinement*
