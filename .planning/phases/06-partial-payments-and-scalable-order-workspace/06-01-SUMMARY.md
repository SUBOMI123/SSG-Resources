# 06-01-PLAN Summary

**Plan:** 06-01 — Partial payment data model and backend  
**Status:** ✅ COMPLETE  
**Date:** April 20, 2026

## What Was Built

- Extended `PaymentStatus` to include `PARTIAL`
- Added `amount_paid` and `balance_due` fields to `Order`
- Added `OrderPayment` history records in:
  - `prisma/schema.prisma`
  - `prisma/migrations/20260420062000_partial_payments/migration.sql`
- Updated shared order types in `src/types/order.ts`
- Extended `src/lib/orders.ts` to:
  - create orders with `amount_paid=0` and `balance_due=total`
  - include payment history in order responses
  - record multiple payments against the same order
  - automatically move payment status between `Waiting`, `Part paid`, and `Paid`
  - block `Paid` status while a balance still exists
- Added admin payment-recording endpoint in `src/app/api/admin/orders/[id]/payments/route.ts`

## Verification Results

✅ `npx prisma generate` passed

✅ `npx prisma migrate deploy` applied `20260420062000_partial_payments`

✅ `npm run build` passed with the new payment route included

✅ Live `POST /api/admin/orders/cmo6ogpmg0002zsvj3jta92j0/payments` recorded a `₦5,000` payment successfully

✅ Live `GET /api/admin/orders` returned:
- `payment_status: "PARTIAL"`
- `amount_paid: 5000`
- `balance_due: 8000`
- recorded payment history for `SSG-MO6OGPM5-WN9VYU`

## Notes

- Existing paid orders were backfilled to `amount_paid=total` and `balance_due=0`.
- Existing unpaid orders were backfilled to `amount_paid=0` and `balance_due=total`.
