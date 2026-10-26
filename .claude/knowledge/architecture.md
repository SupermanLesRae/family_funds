# Architecture

```
api/                    Vercel serverless (Node): login.js, change-pin.js, _lib.js (shared; _ = not a route)
supabase/migrations/    SQL schema, constraints, RLS, seed
src/lib/                Pure business logic: money, dates, aggregate, validation, pin, lockout, config
src/auth/               index.js picks remoteAuth (Supabase+api/) or localAuth (dev); AuthContext.jsx
src/data/               index.js picks supabaseRepo or localRepo; DataContext.jsx (state + validated actions)
src/hooks/              useTransactionFilters (shared by Dashboard + Transactions)
src/components/         Layout, PinPad, Modal(<dialog>), ConfirmDialog, Toast, FilterBar, TransactionTable/Form, Charts…
src/pages/              Login, SetPin, Dashboard, Transactions, Settings
```

## Storage mode (chosen once at build time, never silently switched)
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set → **Supabase mode** (production).
- Otherwise → **Local mode**: localStorage + PBKDF2-hashed PIN. A permanent banner says it is dev-only and not secure/multi-user.
- Both repos expose: `load()`, `save(table,row)`, `remove(table,id)`, `saveSettings(s)`; same row shape (snake_case DB columns).

## Data flow
Page → `useData()` action (validates via `src/lib/validation.js`) → repo → state update. Dashboard/Transactions derive everything with `src/lib/aggregate.js` from the same in-memory set (all rows are loaded; personal-scale data).

## Auth flow
Login → `POST /api/login {pin}` → server verifies (HMAC-derived password → Supabase Auth) → returns session tokens → client `supabase.auth.setSession`. `must_change_pin` in `app_metadata` gates the app (SetPin screen) and RLS.
