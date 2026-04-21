# Deployment Guide

This app is ready to deploy once the production environment is configured.

## 1. What you need

- A Vercel project connected to this repo
- A Supabase Postgres database
- A real business WhatsApp number
- A strong admin session secret

## 2. Required production environment variables

Set these in **Vercel Dashboard -> Project -> Settings -> Environment Variables**:

- `DATABASE_URL`
  - Your Supabase Postgres connection string
- `ADMIN_AUTH_SECRET`
  - A long random secret
  - Example generation command:
    ```bash
    openssl rand -base64 32
    ```
- `BUSINESS_WHATSAPP_NUMBER`
  - The real business WhatsApp number
  - Use international format
  - Example:
    ```text
    +2348012345678
    ```

Optional for later:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`

## 3. Prepare the production database

Run the migration against the production database before public testing:

```bash
DATABASE_URL="your-supabase-url" npm run db:migrate:deploy
```

If you want seed data in the live environment:

```bash
DATABASE_URL="your-supabase-url" npm run db:seed
```

Do this only if that seed data is appropriate for the public environment.

## 4. Verify the release locally

Before deploying, run:

```bash
npm run build
npm run release:check:prod
```

For the production release check, export the same env vars locally first or run it in your CI environment.

## 5. Deploy on Vercel

1. Push the branch to GitHub
2. Open Vercel
3. Import or select the repo
4. Confirm the environment variables are set
5. Deploy

## 6. Post-deploy checks

After deployment:

1. Open `/api/health`
2. Confirm:
   - `database_connection` is `ok`
   - `database_url` is `configured`
   - `admin_auth_secret` is `configured`
   - `business_whatsapp_number` is `configured`
3. Open `/`
4. Open `/products`
5. Test checkout through the WhatsApp handoff
6. Open `/admin/signup` if no production admin exists yet
7. Create the first admin account
8. Test `/admin`

## 7. Current production flow

- Customer checkout is **WhatsApp-first**
- Paystack remains optional and can be enabled later
- The deployment is still valid without Paystack keys

## 8. What blocks public testing

Public testing is blocked only if any of these are missing:

- `DATABASE_URL`
- `ADMIN_AUTH_SECRET`
- `BUSINESS_WHATSAPP_NUMBER`
- production database migrations
