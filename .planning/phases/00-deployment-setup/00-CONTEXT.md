# Phase 0 Context: Deployment Setup

**Phase Goal:** Establish production-ready deployment infrastructure with Docker for local development, Supabase for managed PostgreSQL, Vercel for hosting, and GitHub Actions for CI/CD.

**Phase Duration:** ~2 hours (mostly configuration, minimal coding)

**Phase Type:** Infrastructure setup (blocking prerequisite for all subsequent phases)

**Canonical References:**
- @.planning/research/STACK.md — Technology stack with Vercel recommendation
- @.planning/research/ARCHITECTURE.md — System architecture
- @.planning/PROJECT.md — Project goals and constraints

---

## Decisions

### D-01: Deployment Platform — Vercel
**Context:** Need hosting solution that works with Next.js monolith, minimal ops overhead for solo developer.
**Decision:** Use **Vercel** (official Next.js hosting platform).
**Rationale:**
- Zero configuration deployment (`git push` → live)
- Automatic SSL, CDN, serverless functions
- Preview deployments for every PR
- Integrated with GitHub (auto-deploy on merge)
- $0/month tier sufficient for initial volume
**Constraint:** Vercel pricing escalates with compute; use for Phase 0-2, reassess if volume grows >1000 orders/day
**Alternative Rejected:** AWS/GCP (too much ops burden for solo dev)

### D-02: Database Hosting — Supabase (PostgreSQL)
**Context:** Need managed PostgreSQL with automatic backups, no self-hosted ops.
**Decision:** Use **Supabase** (managed PostgreSQL with built-in backups).
**Rationale:**
- Managed PostgreSQL (same as local dev)
- Automatic daily backups, point-in-time recovery
- Real-time subscriptions built-in (future feature)
- $0 tier covers initial volume (up to 500MB)
- Simple connection string: `postgresql://user:pass@db.supabase.co`
**Constraint:** Must configure IP whitelist (Vercel IP only)
**Alternative Rejected:** Self-hosted PostgreSQL (requires manual backups + monitoring)

### D-03: Local Development Environment — Docker Compose
**Context:** Ensure local dev matches production (PostgreSQL 17 locally, not SQLite).
**Decision:** Use **docker-compose.yml** with PostgreSQL 17 + PgAdmin.
**Rationale:**
- Developers never have `psql` version mismatch issues
- Database state persists across `npm run dev` restarts
- Easy to `docker-compose down` for clean state
- Same schema migrations work locally and production
**Constraint:** Requires Docker Desktop installation (one-time setup)
**Alternative Rejected:** Direct PostgreSQL install (environment drift between developers)

### D-04: CI/CD Pipeline — GitHub Actions
**Context:** Automate testing before deployment to prevent broken code reaching production.
**Decision:** Use **GitHub Actions** (free CI/CD built into GitHub).
**Rationale:**
- Zero cost, integrated with GitHub repo
- On every push: run tests
- On merge to main: deploy to Vercel
- Atomic deployment (all-or-nothing)
**Workflow:**
1. Developer pushes feature branch
2. GitHub Actions runs `npm run test`
3. If pass → PR can merge
4. On merge to main → Vercel deploys automatically
**Constraint:** Test suite must complete <10 min
**Alternative Rejected:** Circle CI / Travis CI (overkill, costs money)

### D-05: Environment Management
**Context:** Credentials must not appear in git; different values per environment.
**Decision:** Use `.env.local` (git-ignored) for local dev; Vercel dashboard for production.
**Rationale:**
- `DATABASE_URL`, `PAYSTACK_KEY` never in git history
- Vercel dashboard encrypts secrets
- Reviewers can't see credentials in PRs
**Local Setup (.env.local):**
```
DATABASE_URL="postgresql://user:password@localhost:5432/ssg_dev"
NODE_ENV="development"
```
**Production Setup (Vercel Dashboard):**
- `DATABASE_URL` → Supabase connection string
- `PAYSTACK_SECRET_KEY` → Live Paystack key (Phase 2)
**Constraint:** All env vars must have `.env.example` template (no secrets)
**Alternative Rejected:** Secrets in code (massive security risk)

### D-06: Docker Image — Node.js Alpine
**Context:** Need minimal Docker image for fast builds and small footprint.
**Decision:** Use **Node.js 22-alpine** as base image (production only; local uses docker-compose).
**Rationale:**
- Alpine Linux: 50MB vs 170MB (Ubuntu)
- Same Node.js 22.x LTS as recommended stack
- Faster deploys to Vercel
**Production Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```
**Constraint:** Multi-stage build to exclude dev dependencies
**Alternative Rejected:** Ubuntu base (bloated; unnecessary)

### D-07: Database Migrations Strategy
**Context:** Schema changes must be versioned and reversible.
**Decision:** Use **Prisma migrations** (committed to git).
**Rationale:**
- `npx prisma migrate dev --name {feature}` creates timestamped migrations
- Migrations tracked in git; reversible with `migrate resolve`
- Same command works local, staging, production
- Automatic schema generation from migration files
**Process:**
1. Local dev: `npx prisma migrate dev --name add_invoice_table`
2. Commit `prisma/migrations/` folder to git
3. Production: `npx prisma migrate deploy` (automatic on Vercel deploy)
**Constraint:** Never edit migration files after they're committed
**Alternative Rejected:** Manual SQL migrations (error-prone, no rollback)

### D-08: Monitoring & Error Tracking (Deferred to Phase 1)
**Context:** Phase 0 sets up infrastructure; Phase 1 adds observability.
**Decision:** Install **Sentry** SDK in Phase 1 (after API layer exists).
**Rationale:**
- Phase 0 is infrastructure; Phase 1 is code
- Sentry requires API routes to capture errors
- Free tier sufficient for initial volume
**Will configure in Phase 1 Plan 02 (API endpoints)**
**Note:** This is deferred but logged to prevent gaps in Phase 1

---

## Implementation Checklist

- [ ] Create Dockerfile for production image
- [ ] Create docker-compose.yml for local development
- [ ] Set up Supabase project and create PostgreSQL database
- [ ] Set up Vercel project linked to GitHub repo
- [ ] Create GitHub Actions workflow (.github/workflows/deploy.yml)
- [ ] Create .env.example template (no secrets)
- [ ] Verify local dev with docker-compose
- [ ] Verify Vercel preview deployment on test PR
- [ ] Document setup process in README.md

---

## Success Criteria for Phase 0

✓ Local development uses Docker Compose with PostgreSQL 17
✓ Prisma migrations work seamlessly local → production
✓ GitHub Actions runs tests automatically on every push
✓ Merging to main triggers automatic Vercel deployment
✓ Supabase database is provisioned and accessible from Vercel
✓ Environment variables are managed securely (not in git)
✓ Zero manual deployment steps (fully automated)
✓ `.env.example` exists with template (no secrets exposed)

---

## Related Artifacts

**Research Documents:**
- STACK.md → Technology choices
- ARCHITECTURE.md → System design

**Subsequent Phases:**
- Phase 1 depends on Phase 0 (database migrations, API routes, GitHub deployment)
- Phase 1 Plan 02 adds Sentry SDK for error tracking

**Phase 0 Blockers:**
- None (can start immediately; requires only GitHub account + docker/Supabase signups)

---

*Phase 0 Context created: April 19, 2026*
*Deployment setup strategy for solo developer*
