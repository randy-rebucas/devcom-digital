# Devcom

Marketing site + subscription-gated digital tools for **Devcom Digital Marketing Services**. Users register, subscribe via PayPal, and receive a unique license key that unlocks the tools dashboard for as long as their subscription is active.

## Stack

- Next.js 16 (App Router)
- NextAuth.js v5 (Credentials provider, JWT sessions)
- Prisma 6 + PostgreSQL
- PayPal Subscriptions (Checkout SDK + webhooks)

## How it works

1. A visitor creates an account (`/register`).
2. They subscribe on `/pricing` via the PayPal Subscribe button, which creates a PayPal subscription and redirects for approval.
3. On approval, the client confirms the subscription with `/api/paypal/create-subscription`; PayPal webhooks (`/api/paypal/webhook`) are the source of truth for later lifecycle changes (cancellation, suspension, expiry).
4. The moment a subscription becomes `ACTIVE`, a license key is generated (`src/lib/license.ts`) and stored against the user.
5. `/dashboard` shows subscription status and the license key. `/tools` (and `/dashboard`) are gated: only users with an `ACTIVE` subscription and an active license can access them. Route access is additionally enforced in `src/proxy.ts`.
6. If a subscription is cancelled/suspended/expired, the webhook revokes the license automatically.

## Setup

1. **Database**: provision a Postgres database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and set `DATABASE_URL`.
2. Copy `.env.example` to `.env.local` and fill in the values:
   - `AUTH_SECRET`: `openssl rand -base64 32`
   - `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`: from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
   - `PAYPAL_PLAN_ID`: create a Product + a monthly billing Plan in the dashboard (or via the Subscriptions API) and paste its plan ID
   - `PAYPAL_WEBHOOK_ID`: create a webhook pointed at `https://<your-domain>/api/paypal/webhook`, subscribed to `BILLING.SUBSCRIPTION.*` events
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: same as `PAYPAL_CLIENT_ID` (exposed to the browser for the PayPal SDK)
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. (Optional) Seed a demo account with an active subscription, license, and admin role:
   ```bash
   npx prisma db seed
   ```

## Demo account

| Field    | Value                     |
| -------- | ------------------------- |
| Email    | `demo@devcomdigital.com`  |
| Password | `demo12345`                |
| Role     | `ADMIN`                    |

Seeded via `prisma/seed.ts` with an active subscription and license key so it can access `/tools` immediately.

## Notes

- The pricing page shows a config warning instead of the PayPal button if `PAYPAL_PLAN_ID` / `NEXT_PUBLIC_PAYPAL_CLIENT_ID` aren't set.
- License keys are formatted `DEVCOM-XXXX-XXXX-XXXX-XXXX` and generated in `src/lib/license.ts`.
- Digital tools listed on `/tools` are placeholders — swap in the real tools/links once built.
