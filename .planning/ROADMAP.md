# Roadmap: Digital Inventory & Order Management System

## Overview

Build a complete digital inventory and order management system from scratch. Start with deployment infrastructure (Phase 0), then real-time inventory tracking, add an e-commerce website with payment processing, implement order management workflows, and finally automate invoicing and financial tracking.

## Phases

- [x] **Phase 0: Deployment Setup** - Establish Docker, Supabase, Vercel, and GitHub Actions for automated deployment
- [x] **Phase 1: Inventory Tracking** - Establish real-time inventory management foundation
- [ ] **Phase 2: E-Commerce Website** - Launch customer-facing website with product catalog and Paystack payment integration
- [x] **Phase 3: Order Management** - Implement comprehensive order processing workflow for manual and web orders
- [x] **Phase 4: Invoicing & Payments** - Automate document generation and financial tracking
- [x] **Phase 5: Production hardening and UI polish** - Improve production readiness, polish UI quality, and harden operator workflows
- [x] **Phase 6: Partial payments and scalable order workspace** - Track installment payments and replace the card wall with a manageable order operations workspace

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
- [x] 00-01-PLAN.md — Docker setup for local development
- [x] 00-02-PLAN.md — Supabase + Vercel hosting integration
- [x] 00-03-PLAN.md — GitHub Actions CI/CD pipeline

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
- [x] 01-01-PLAN.md — Database schema with Prisma and PostgreSQL initialization
- [x] 01-02-PLAN.md — Inventory API endpoints with atomic transactions
- [x] 01-03-PLAN.md — Admin dashboard UI for real-time viewing and manual updates

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
**Plans**: 4 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md — Public storefront and product catalog
- [x] 02-02-PLAN.md — Guest checkout and order creation
- [ ] 02-03-PLAN.md — Paystack payment integration and verification
- [x] 02-04-PLAN.md — Order confirmation and customer tracking

### Phase 3: Order Management
**Goal**: Business can capture and manage orders from creation to fulfillment
**Depends on**: Phase 2
**Requirements**: ORD-01, ORD-02, ORD-03, ORD-04
**Success Criteria** (what must be TRUE):
  1. All orders from website or manual entry are captured and recorded
  2. Orders can be easily created, assigned, and tracked in real-time
  3. Order status progresses clearly from Pending → Confirmed → Delivered → Paid
  4. Admin can paste raw order text which is parsed to auto-populate items and quantities
**Plans**: 3 plans in 2 waves

Plans:
- [x] 03-01-PLAN.md — Unified admin order dashboard and manual order creation
- [x] 03-02-PLAN.md — Order assignment and status workflow
- [x] 03-03-PLAN.md — Raw text parsing for manual order entry

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
**Plans**: 3 plans in 2 waves

Plans:
- [x] 04-01-PLAN.md — Invoice and waybill generation
- [x] 04-02-PLAN.md — Payment tracking and reconciliation
- [x] 04-03-PLAN.md — Financial reporting and dashboards

## Progress

### Phase 5: Production hardening and UI polish
**Goal**: Improve production readiness, polish the interface, and harden the app for real deployment
**Depends on**: Phase 4
**Requirements**: WEB-01
**Success Criteria** (what must be TRUE):
  1. Customer-facing screens no longer read like implementation artifacts
  2. Admin surfaces present a coherent, production-quality interface
  3. Remaining production hardening work is explicitly tracked and executed
**Plans**: 3 plans in 2 waves

Plans:
- [x] 05-01-PLAN.md — Shared admin polish and customer-facing copy cleanup
- [x] 05-02-PLAN.md — Admin auth and operator hardening
- [x] 05-03-PLAN.md — Release readiness and final deployment validation

## Progress

### Phase 6: Partial payments and scalable order workspace
**Goal**: Support installment payments and give the admin team a scalable order management workspace
**Depends on**: Phase 5
**Requirements**: PAY-01, PAY-02, ORD-02
**Success Criteria** (what must be TRUE):
  1. Orders can track money paid so far, balance remaining, and fully paid state
  2. Admin can record more than one payment against the same order
  3. Outstanding balances are visible clearly across order and payment screens
  4. The main order workspace supports filters and list management for larger order volumes
**Plans**: 3 plans in 2 waves

Plans:
- [x] 06-01-PLAN.md — Partial payment data model and backend
- [x] 06-02-PLAN.md — Filterable orders workspace and payment recording UI
- [x] 06-03-PLAN.md — Outstanding balance reporting and document updates

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Deployment Setup | 3/3 | Complete | April 19, 2026 |
| 1. Inventory Tracking | 3/3 | Complete | April 19, 2026 |
| 2. E-Commerce Website | 3/4 | Waiting on external config | - |
| 3. Order Management | 3/3 | Complete | April 20, 2026 |
| 4. Invoicing & Payments | 3/3 | Complete | April 20, 2026 |
| 5. Production hardening and UI polish | 3/3 | Complete | April 20, 2026 |
| 6. Partial payments and scalable order workspace | 3/3 | Complete | April 20, 2026 |

---
*Roadmap created: April 19, 2026*
*Last updated: April 20, 2026 after completing Phase 6 partial payment work*
