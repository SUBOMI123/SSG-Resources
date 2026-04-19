# Roadmap: Digital Inventory & Order Management System

## Overview

Build a complete digital inventory and order management system from scratch. Start with deployment infrastructure (Phase 0), then real-time inventory tracking, add an e-commerce website with payment processing, implement order management workflows, and finally automate invoicing and financial tracking.

## Phases

- [ ] **Phase 0: Deployment Setup** - Establish Docker, Supabase, Vercel, and GitHub Actions for automated deployment
- [ ] **Phase 1: Inventory Tracking** - Establish real-time inventory management foundation
- [ ] **Phase 2: E-Commerce Website** - Launch customer-facing website with product catalog and Paystack payment integration
- [ ] **Phase 3: Order Management** - Implement comprehensive order processing workflow for manual and web orders
- [ ] **Phase 4: Invoicing & Payments** - Automate document generation and financial tracking

## Phase Details

### Phase 0: Deployment Setup
**Goal**: Establish production-ready infrastructure for easy deployment and management
**Depends on**: Nothing (foundational setup)
**Requirements**: None (infrastructure only)
**Success Criteria** (what must be TRUE):
  1. Local development uses Docker with PostgreSQL 17 (matches production)
  2. Database hosted on managed Supabase (zero ops burden)
  3. Application deployed to Vercel (one-click deploys)
  4. GitHub Actions runs tests automatically (blocks broken code)
  5. Merging to main auto-deploys to production (zero manual steps)
**Plans**: 3 plans in 2 waves

Plans:
- [ ] 00-01-PLAN.md — Docker setup for local development
- [ ] 00-02-PLAN.md — Supabase + Vercel hosting integration
- [ ] 00-03-PLAN.md — GitHub Actions CI/CD pipeline

### Phase 1: Inventory Tracking
**Goal**: Users can track and manage inventory levels in real-time
**Depends on**: Phase 0
**Requirements**: INV-04, INV-05, INV-06
**Success Criteria** (what must be TRUE):
  1. Admin can view current stock levels for all products in real-time
  2. Stock levels update automatically when orders are placed
  3. Admin can manually update stock when new goods arrive
**Plans**: 3 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md — Database schema with Prisma and PostgreSQL initialization
- [ ] 01-02-PLAN.md — Inventory API endpoints with atomic transactions
- [ ] 01-03-PLAN.md — Admin dashboard UI for real-time viewing and manual updates

### Phase 2: E-Commerce Website
**Goal**: Customers can discover products, place orders online, and pay securely via Paystack
**Depends on**: Phase 1
**Requirements**: WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, WEB-06
**Success Criteria** (what must be TRUE):
  1. Customers can browse and view all available products with descriptions and pricing
  2. Customers can place orders with product selection and quantity specification
  3. Orders can be paid securely using Paystack payment gateway
  4. Order confirmation and receipt are sent after successful payment
  5. Customers can track order status (Pending → Confirmed → Delivered)
  6. Website displays business information and professional appearance
**Plans**: TBD

Plans:
- [ ] 02-01: [Product catalog and browse experience]
- [ ] 02-02: [Shopping cart and order placement]
- [ ] 02-03: [Paystack payment integration]
- [ ] 02-04: [Order confirmation and customer tracking]

### Phase 3: Order Management
**Goal**: Business can capture and manage orders from creation to fulfillment
**Depends on**: Phase 2
**Requirements**: ORD-01, ORD-02, ORD-03, ORD-04
**Success Criteria** (what must be TRUE):
  1. All orders from website or manual entry are captured and recorded
  2. Orders can be easily created, assigned, and tracked in real-time
  3. Order status progresses clearly from Pending → Confirmed → Delivered → Paid
  4. Admin can paste raw order text which is parsed to auto-populate items and quantities
**Plans**: TBD

Plans:
- [ ] 03-01: [Manual order entry with text parsing]
- [ ] 03-02: [Order tracking and status management]
- [ ] 03-03: [Order assignment and fulfillment workflow]

### Phase 4: Invoicing & Payments
**Goal**: Generate documents automatically and track financial status
**Depends on**: Phase 3
**Requirements**: INV-01, INV-02, INV-03, PAY-01, PAY-02
**Success Criteria** (what must be TRUE):
  1. Invoices are generated instantly from completed orders
  2. Waybills are generated instantly from completed orders
  3. Any document can be downloaded or printed at any time
  4. System tracks which orders are paid and which are outstanding
  5. Business can view total sales, collected payments, and outstanding balances
**Plans**: TBD

Plans:
- [ ] 04-01: [Invoice and waybill generation]
- [ ] 04-02: [Payment tracking and reconciliation]
- [ ] 04-03: [Financial reporting and dashboards]

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Deployment Setup | 0/3 | Planned | - |
| 1. Inventory Tracking | 0/3 | Planned | - |
| 2. E-Commerce Website | 0/4 | Not started | - |
| 3. Order Management | 0/3 | Not started | - |
| 4. Invoicing & Payments | 0/3 | Not started | - |

---
*Roadmap created: April 19, 2026*
*Last updated: April 19, 2026 after adding Phase 0 (Deployment Setup)*
