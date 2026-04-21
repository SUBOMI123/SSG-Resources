---
id: SEED-001
status: dormant
planted: 2026-04-20
planted_during: Phase 2
trigger_when: before production launch, or as soon as Paystack test/live keys are available
scope: Medium
---

# SEED-001: Revisit live Paystack verification

## Why This Matters

Phase 2 already includes the Paystack integration code paths, but live payment initialization,
verification, and webhook confirmation have not been exercised because the environment does not
yet have `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`.

Without this follow-up, the storefront payment step remains only partially verified.

## When to Surface

**Trigger:** before production launch, or as soon as Paystack test/live keys are available

This seed should be revisited when any of these are true:
- Paystack sandbox or live keys are ready to add to `.env.local` / deployment settings
- The team is preparing a production-ready release of the storefront
- Phase 2 needs to be closed as fully verified

## Scope Estimate

**Medium** — requires environment configuration plus live end-to-end verification of initialize,
callback/verify, and webhook flows.

## Breadcrumbs

Related code and docs:

- `.planning/phases/02-e-commerce-website/02-03-PLAN.md`
- `.planning/phases/02-e-commerce-website/02-03-SUMMARY.md`
- `src/lib/paystack.ts`
- `src/app/api/paystack/initialize/route.ts`
- `src/app/api/paystack/verify/route.ts`
- `src/app/api/paystack/webhook/route.ts`
- `.planning/STATE.md`

## Notes

The local fallback behavior already works and returns `config_missing` cleanly. The next pass
should use real keys and verify at least one successful payment lifecycle end to end.
