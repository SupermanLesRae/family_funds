# Common gotchas

(Carried over lessons from the Cards MFE repo, adapted.)

- ⚠️ **Cents vs rand** — a missed ÷100 / ×100 at a call site makes numbers 100× off. Convert only in `money.js` at the UI edge.
- **Never assume a call succeeded** — every repo/API call can fail; surface errors, don't swallow them. Don't treat "not an error" as "success" when results have several shapes.
- **Don't hand-write a parallel copy of a source of truth** — validation rules in `src/lib/validation.js`/`pin.js` are shared by client and `api/`; DB constraints mirror them.
- **Don't fix dev/preview issues by editing tracked config** to suit one machine; use untracked `.env.local`.
- **Don't reach for tools by habit** — no TypeScript, no Redux, no axios, no date library, no UI kit.
- **Supabase returns max 1000 rows per request** — `fetchAll` pages with `.range()`.
- **`new Date('YYYY-MM-DD')` is UTC** → off-by-one days locally. Use string dates + `Date.UTC` helpers in `dates.js`.
- **Vercel**: files in `api/` starting with `_` aren't routes; SPA rewrite must exclude `/api/`.
- **`npm run dev` has no `/api/*`** — use `vercel dev` to test Supabase-mode login locally, or local mode.
- **Changing `PIN_PEPPER` locks you out** (derived passwords change). Reset the admin user in Supabase to recover.
- **Deleting a category/person with history** is blocked by FK `on delete restrict` — deactivate instead.
