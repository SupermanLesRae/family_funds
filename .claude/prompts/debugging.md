# Prompt: Debugging

Find the **root cause** — don't guess, don't patch symptoms. Give the likely cause first, then investigate only directly related files.

## Trace the path
UI → DataContext action → repo (`supabaseRepo` / `localRepo`) → Supabase (RLS!) → response. For auth: `useAuth` → `src/auth/*` → `api/login.js` / `api/change-pin.js` → Supabase Auth.

## Common sources
- RLS returns empty rows / permission errors: admin role claim missing, or `must_change_pin` still true.
- Wrong storage mode: `VITE_SUPABASE_URL` unset → local mode banner shown.
- Money 100× off: cents vs rand conversion at the UI edge.
- Date off by one: timezone — use `todayISO()`, dates are `YYYY-MM-DD` strings, never `new Date(str)`.
- Supabase 1000-row cap: `fetchAll` must page.
- `/api/*` 404 in `npm run dev`: functions only run under `vercel dev`/Vercel.

## Deliver
Root cause · evidence (file:line) · minimal fix · regression risk.
