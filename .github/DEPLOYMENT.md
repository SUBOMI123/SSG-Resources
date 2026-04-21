# Deployment Pipeline

This project uses GitHub Actions for automated testing and deployment.

## Workflows

### 1. Test Workflow (test.yml)
Triggered on: Every push and pull request

Steps:
1. Checkout code
2. Setup Node.js 22
3. Install dependencies
4. Setup PostgreSQL test database
5. Run Prisma migrations
6. Execute `npm test`
7. Upload coverage to Codecov

**What this means:** Every push is tested. If tests fail, merge is blocked.

### 2. Deploy Workflow (deploy.yml)
Triggered on: Merge to main branch only

Steps:
1. Checkout code
2. Deploy to Vercel using API token
3. Vercel auto-detects Next.js and runs `npm run build`
4. Production deployment lives

**What this means:** Merging to main = instant live production deployment.

## Local Development vs Production

| Command | Local | Production |
|---------|-------|------------|
| `npm run dev` | Hot reload, local database | N/A |
| `npm run build` | Build Next.js | Run by Vercel |
| `npm test` | Local tests | Run by GitHub Actions |
| `git push` | Nothing | Triggers test workflow |
| Merge to main | Nothing | Triggers deploy workflow |

## Troubleshooting

### Test workflow fails
- Check error message in GitHub Actions tab
- Common causes:
  - Database migration failed
  - Missing dependencies
  - Test syntax errors
- Fix locally: `npm test` and iterate

### Deploy workflow fails
- Usually means tests passed but Vercel build failed
- Check Vercel dashboard for build logs
- Common causes:
  - Environment variable missing
  - Build output incorrect
  - Prisma schema mismatch

### Manual Deployment
Emergency only — not recommended:
```bash
# Prerequisite: vercel CLI installed
npm install -g vercel

# Deploy
vercel --prod

# Vercel will:
# 1. Download environment variables
# 2. Run `npm run build`
# 3. Deploy to production URL
```

---

For more details, see:
- `.github/workflows/test.yml` — Test pipeline
- `.github/workflows/deploy.yml` — Deploy pipeline
