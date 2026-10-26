# FamilyFunds (Personal Spending Tracker)

React + Vite + Tailwind + Recharts. Supabase for storage/auth, Vercel for hosting. Amounts are ZAR, stored as integer cents.

## Storage modes

| Mode | When | Notes |
|---|---|---|
| **Supabase** (production) | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set at build time | Server-side PIN check, RLS-protected data |
| **Local dev** | those vars unset | Browser localStorage + hashed PIN. Banner shown. **Not secure, not multi-user.** Never switches silently. |

## Local development (no setup)

```bash
npm install
npm run dev
```

Sign in with the initial PIN `0000`; you must immediately set a new 6–8 digit PIN.

## Supabase setup

1. Create a Supabase project. **Authentication → Providers → Email: disable "Allow new users to sign up".**
2. SQL editor: run `supabase/migrations/0001_init.sql` (tables, constraints, RLS, seed categories).
3. Copy the Project URL, `anon` key, and `service_role` key (Settings → API).
4. Copy `.env.example` → `.env.local` and fill in. Generate `PIN_PEPPER` with `openssl rand -hex 32`. Keep it safe: changing it invalidates the stored PIN.

Test the real login locally with the Vercel CLI (serves `api/*`):

```bash
npx vercel dev
```

`npm run dev` has no `/api` routes, so Supabase-mode sign-in only works under `vercel dev` or on Vercel.

## Deploy to Vercel

1. Push to Git and import the repo in Vercel (framework: Vite; build `npm run build`, output `dist` — auto-detected).
2. Add env vars (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PIN_PEPPER`, optional `INITIAL_PIN`, `VITE_APP_TIMEZONE`.
3. Deploy, open the site, sign in with the initial PIN (`0000` unless `INITIAL_PIN` set) and **change it immediately**. Until you do, RLS blocks all data access.

`vercel.json` rewrites all non-`/api` paths to `index.html` for client-side routing.

## How auth works

- `api/login.js` / `api/change-pin.js` verify the PIN server-side. The PIN is turned into a Supabase Auth password via HMAC with `PIN_PEPPER`; no PIN or hash is ever sent to or stored in the browser.
- 5 wrong attempts in 15 minutes lock sign-in for the rest of the window (global, single admin — an attacker can temporarily lock you out).
- RLS (`is_admin()`) requires the admin role and a replaced default PIN, so the database is protected independent of the UI.

## Structure

`src/lib/` pure logic (money, dates, aggregate, validation, pin, lockout) · `src/data/` repos + context · `src/auth/` · `src/components/` · `src/pages/` · `api/` serverless · `supabase/migrations/`.

## Dashboard card semantics

Total, Transactions, Top Category, Top Person follow all filters. "Spending This Month" and "Today" use their own fixed window but honour category/person filters.

## Manual steps / not yet verified

- Supabase project, migration, env vars, and Vercel deploy are manual.
- Supabase-mode login (`api/*`) and RLS have **not been exercised against a real project** here; verify after setup (login, forced PIN change, CRUD, lockout, and that anon requests get no data).
- No automated tests.

## Mac app

A thin Electron shell in `desktop/` that opens the deployed web app (data lives in Supabase).

1. Deploy to Vercel first (see "Online database" steps) and put the URL in `desktop/config.json` (or set `FAMILYFUNDS_URL`).
2. `cd desktop && npm install`
3. `npm start` to run it, `npm run dist` to build `dist/FamilyFunds-*.dmg`.

Unsigned builds show a Gatekeeper warning: right-click the app and choose Open once.
