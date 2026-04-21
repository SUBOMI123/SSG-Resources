# Digital Inventory & Order Management System

A complete inventory tracking, order management, and invoicing system built with Next.js and PostgreSQL, with WhatsApp-first checkout and optional Paystack later.

## Quick Start

### Prerequisites
- Node.js 22.x LTS
- Docker Desktop (for PostgreSQL)
- Git

### Local Development Setup

1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd SSG-Resources
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed (defaults work for docker-compose)
   ```

4. **Start database:**
   ```bash
   docker-compose up -d
   # Verify: pg_isready -h localhost -U ssg_user
   ```

5. **Initialize database schema:**
   ```bash
   npx prisma migrate dev
   # This creates tables and runs seed data
   ```

6. **Start development server:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Admin dashboard: http://localhost:3000/admin/inventory
   ```

7. **Local admin login:**
   ```text
   Email: admin@example.com
   Password: Password123
   ```

### Common Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start PostgreSQL in background |
| `docker-compose down` | Stop database (data persists) |
| `docker-compose down -v` | Stop + delete all data (clean slate) |
| `npx prisma studio` | Open Prisma Studio (visual database editor) |
| `npm run dev` | Start Next.js dev server |
| `npm run test` | Run tests (Phase 1+) |
| `npm run build` | Build for production |
| `npm run release:check` | Show local release-readiness warnings |
| `npm run release:check:prod` | Fail if production env requirements are missing |
| `npm run db:migrate:deploy` | Apply Prisma migrations to the target production database |

### Admin Workflows

- Inventory management: `/admin/inventory`
- Orders and status updates: `/admin/orders`
- Outstanding payment tracking: `/admin/payments`

An order is still unpaid when its payment status is `Waiting`.

### Database Access

- **Via PgAdmin Web UI:**
  - Visit http://localhost:5050
  - Login: admin@example.com / admin
  - Connect to postgres:5432

- **Via `psql` CLI:**
  ```bash
  psql postgresql://ssg_user:ssg_password@localhost:5432/ssg_dev
  ```

### Production Deployment

Deployment is automated via GitHub Actions:
1. Push to feature branch → GitHub Actions runs tests
2. Create PR → Review code
3. Merge to main → Vercel deploys automatically
4. Visit https://your-app.vercel.app

**Environment Variables (set in Vercel Dashboard):**
- `DATABASE_URL` → Supabase connection string
- `ADMIN_AUTH_SECRET` → Strong random secret for admin sessions
- `BUSINESS_WHATSAPP_NUMBER` → Business WhatsApp number used for customer checkout handoff
- `PAYSTACK_SECRET_KEY` → Live Paystack key (when enabled)
- `PAYSTACK_PUBLIC_KEY` → Live Paystack public key (when enabled)

**Release Checklist:**
1. Set `DATABASE_URL` in Vercel
2. Set `ADMIN_AUTH_SECRET` in Vercel
3. Set `BUSINESS_WHATSAPP_NUMBER` in Vercel
4. Add Paystack keys when you are ready to enable live payment verification
5. Run `npm run build`
6. Run `npm run release:check:prod`
7. Verify `/api/health` returns `ok` or expected warnings after deployment

See [DEPLOYMENT.md](/Users/subomi/Desktop/SSG-Resources/DEPLOYMENT.md:1) for the exact deployment sequence.

### Troubleshooting

**Port 5432 already in use:**
```bash
# Kill existing PostgreSQL container
docker-compose down

# Or use different port in docker-compose.yml
```

**Prisma schema out of sync:**
```bash
# Reset database to current schema
npx prisma migrate reset
```

---

For more details, see `.planning/` directory for phase documentation.
