# Stack Research

**Domain:** Digital inventory and order management system
**Researched:** April 19, 2026
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 22.x LTS | Runtime environment for server-side JavaScript | Latest LTS with modern features like native fetch and test runner; widely adopted for full-stack web apps requiring real-time inventory updates |
| Next.js | 15.x | Full-stack React framework with SSR/SSG | Provides built-in API routes, optimized performance for e-commerce-like features; standard for business websites with order management |
| PostgreSQL | 17.x | Relational database for data persistence | ACID compliance essential for inventory transactions and order integrity; advanced features like JSON support for flexible product data |
| Prisma | 7.x | Type-safe ORM and migration tool | Generates type-safe database clients from schema; prevents SQL injection and provides excellent DX for complex queries like inventory reports |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Auth.js | Latest | Authentication and authorization | For secure user login, role-based access to inventory/order data |
| Tailwind CSS | 4.x | Utility-first CSS framework | Rapid UI development for admin dashboards and customer-facing order forms |
| Puppeteer | Latest | Headless browser for PDF generation | Generating invoices and waybills from HTML templates |
| React Hook Form | Latest | Form handling with validation | Managing complex order forms and inventory entry with real-time validation |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | 5.x | Type safety for large-scale app | Essential for maintaining code quality in inventory/order logic |
| ESLint + Prettier | Latest | Code linting and formatting | Consistent code style across team |
| Vercel | N/A | Deployment platform | Optimized for Next.js apps with global CDN for fast order processing |

## Installation

```bash
# Core
npm install next@15 react@19 react-dom@19
npm install prisma@7 @prisma/client
npm install @auth/core

# Supporting
npm install tailwindcss@4 puppeteer react-hook-form

# Dev dependencies
npm install -D typescript @types/node eslint prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Express.js + React | If separating frontend/backend or needing microservices architecture |
| PostgreSQL | MySQL | If team has MySQL expertise or simpler schema requirements |
| Prisma | Drizzle ORM | If preferring SQL-like syntax over Prisma's query builder |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MongoDB | Lacks ACID transactions needed for inventory consistency | PostgreSQL |
| PHP/Laravel | Slower development cycle, less modern ecosystem | Node.js/Next.js |
| Ruby on Rails | Smaller community for inventory systems, slower runtime | Next.js |

## Stack Patterns by Variant

**If high-volume orders (>1000/day):**
- Add Redis for caching inventory counts
- Because prevents database overload during peak times

**If mobile app needed later:**
- Use React Native for shared components
- Because code reuse with web app

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js@15 | React@19 | Requires React 19 for latest features |
| Prisma@7 | PostgreSQL@17 | Full support for all PostgreSQL features |

## Sources

- /nodejs/node — Latest LTS version verified
- /facebook/react — Latest stable version
- /websites/nextjs — Framework capabilities
- /prisma/prisma — ORM features and versions
- /websites/postgresql_17 — Database features
- /websites/tailwindcss — CSS framework version
- /websites/authjs_dev — Auth solution

---
*Stack research for: Digital inventory and order management system*
*Researched: April 19, 2026*</content>
<parameter name="filePath">/Users/subomi/Desktop/SSG-Resources/.planning/research/STACK.md