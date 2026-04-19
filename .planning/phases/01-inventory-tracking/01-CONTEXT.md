# Phase 1: Inventory Tracking - Context

**Gathered:** April 19, 2026
**Status:** Ready for planning

## Phase Boundary

Phase 1 establishes real-time inventory management as the foundation for the entire system. 

**What this phase delivers:**
- Real-time inventory dashboard showing current stock levels
- Automatic inventory deduction when orders are placed
- Manual inventory updates by admin when new stock arrives
- Database schema for products and inventory tracking

**Requirements covered:** INV-04, INV-05, INV-06

## Implementation Decisions

### Inventory Tracking System
- **D-01:** Use PostgreSQL ACID transactions for inventory consistency to prevent overselling and race conditions
- **D-02:** Implement atomic inventory updates with database-level locking (Prisma transactions) 
- **D-03:** Store inventory at product level initially (multi-location support deferred to v2)
- **D-04:** Inventory updates triggered immediately on order creation, not async processing
- **D-05:** Admin dashboard shows real-time counts with page refresh (polling every 30 seconds is acceptable)

### Data Model
- **D-06:** Product table with fields: id, name, sku, quantity_on_hand, reserved (pending orders), available
- **D-07:** Inventory history table to track all changes with timestamp and reason (manual/order)
- **D-08:** No soft deletes for products initially (keep it simple)

### Claude's Discretion
- UI component library and styling approach (Tailwind already selected in research)
- Specific validation rules and business logic edge cases
- Error handling and logging strategy
- API response formats and error codes

## Canonical References

### Project Stack
- `research/STACK.md` — Node.js 22.x LTS, Next.js 15.x, PostgreSQL 17.x, Prisma 7.x
- `research/ARCHITECTURE.md` — Layered architecture with presentation, business logic, data access
- `research/PITFALLS.md` — Critical pitfalls: inventory inconsistencies, race conditions, concurrency

### Phase Requirements
- `REQUIREMENTS.md` — INV-04, INV-05, INV-06

---

*Phase: 01-inventory-tracking*
*Context gathered: April 19, 2026*
