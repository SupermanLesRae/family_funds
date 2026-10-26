# Prompt: Data / API work

Data access lives in `src/data/` (repo layer) and `api/` (server-side auth). Read `knowledge/auth-security.md` first for anything in `api/` or migrations.

## Steps
1. Components never call Supabase/fetch directly — go through `useData()` / `useAuth()`.
2. New persisted field: migration in `supabase/migrations/` (+ constraints + RLS), `supabaseRepo.js`, `localRepo.js`, and DataContext in the same change. Both repos must behave identically.
3. Validation lives in `src/lib/validation.js`; DB constraints are the backstop, map their errors to friendly messages.
4. Handle every failure: repos throw, DataContext surfaces the message via toast/inline error. Never assume success.

## Rules
- Integer cents only. No raw backend errors shown to users. No secrets client-side.
- Serverless functions: POST only, validate input, generic 500s, never echo PINs.
