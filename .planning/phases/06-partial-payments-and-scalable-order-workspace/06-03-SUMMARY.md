# 06-03-PLAN Summary

**Plan:** 06-03 — Outstanding balance reporting and document updates  
**Status:** ✅ COMPLETE  
**Date:** April 20, 2026

## What Was Built

- Updated `src/lib/payments.ts` so dashboard totals use:
  - collected amount from money actually received
  - outstanding amount from remaining balance
  - separate `Part paid` bucket
- Updated `src/app/admin/payments/page.tsx` to show:
  - `Waiting for payment`
  - `Part paid`
  - `Paid orders`
  - `Payment problems`
  - `Paid so far` and `Balance left` columns
- Updated `src/app/admin/finance/page.tsx` to reflect partial-payment totals
- Updated `src/components/OrderStatusCard.tsx` to show the simpler payment wording
- Updated invoice generation in:
  - `src/lib/documents.ts`
  - `src/components/InvoiceDocument.tsx`
  so invoices show `Amount paid` and `Balance left`

## Verification Results

✅ `npm run build` passed cleanly without the dev server running

✅ Live `/admin/payments` showed:
- `Money received` as `₦20,000`
- `Waiting for payment` as `₦14,000`
- a `Part paid` bucket with `SSG-MO6OGPM5-WN9VYU`
- `Paid so far ₦5,000`
- `Balance left ₦8,000`

✅ Live `/documents/invoice/SSG-MO6OGPM5-WN9VYU` showed:
- `Payment: Part paid`
- `Amount paid ₦5,000`
- `Balance left ₦8,000`

## Notes

- Payment reporting now reflects the real operating question: how much money has been received, and how much is still left to collect.
- Live Paystack verification remains separately deferred until keys are available.
