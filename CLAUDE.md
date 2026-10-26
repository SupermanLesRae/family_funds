# CLAUDE.md

Guidance for Claude Code in this repository.

## What this is

Fintrack — Personal Spending Tracker. React 18 + JavaScript (JSX, **no TypeScript**) + Vite + Tailwind v4 + Recharts + React Router. Supabase (Postgres + Auth) for production persistence; Vercel hosts the SPA and two serverless functions (`api/`) that do PIN verification. A clearly labelled browser-storage mode exists for local development only.

---

## Commands

Scripts are in `package.json`: `npm run dev`, `npm run build`, `npm run preview`. Node 22.

## Communication Style

- Be brief, bullets over prose, no preamble or recap.
- For yes/no questions, start with "Yes" or "No".
- If extra detail could help, summarise first and offer to elaborate.

## Hard Rules — Always Apply

### Token-Saving Validation

- **Do not start the dev server, build, or run anything "just to verify" unless asked** (or the task explicitly requires a build, e.g. the initial delivery).
- No tests unless explicitly requested.
- After changes, review **changed files only**: syntax, imports, references, consistency with nearby code.
- Run the smallest relevant command; rerun only what failed.

### Response and Exploration

- Stick to the task. Start at the most relevant files. No speculative exploration or scope creep.
- Smallest change that satisfies the request. No unrelated refactors, renames, abstractions.

### Money

- Amounts are **integer cents** everywhere (DB `amount_cents`, state, props). Convert only at the UI edge via `src/lib/money.js`. Never use floats for arithmetic. See `.claude/knowledge/common-gotchas.md`.

### Business logic

- One implementation only, in `src/lib/` (money, dates, aggregate, validation, pin, lockout). Dashboard and Transactions page must use the same functions. Never re-implement filtering/totals in a component.

### Security

- Never hardcode secrets; never commit `.env*` (only `.env.example` placeholders).
- Never store or log a PIN (plain text) in browser storage, console, or responses. Local mode stores a PBKDF2 hash only.
- Supabase **service-role key and `PIN_PEPPER` are server-only** (`api/`). Never prefix them `VITE_`.
- Frontend route protection is UX only; RLS in `supabase/migrations/` is the real gate. Any new table needs RLS + `is_admin()` policy.
- Don't claim production security complete until auth, RLS, and deployment are verified.
- See `.claude/knowledge/auth-security.md` before touching `api/`, `src/auth/`, or migrations.

### Scope

- No budgets, bank integrations, recurring payments, exports, multi-currency, or other unrequested features.
- No new dependencies unless required.

### UI

- Tailwind with semantic tokens (`bg-surface`, `text-muted`, `bg-brand`, …) defined in `src/index.css`; no per-component dark: variants.
- Every screen: loading / empty / error / success states. Semantic HTML, labelled inputs, errors beside fields (`aria-describedby`), keyboard-operable, native `<dialog>` for modals.

## Workflow

Non-trivial: **Explore → Plan → Code → Validate** (see Hard Rules). Read only the `.claude/knowledge/` file that matches the task.

## Knowledge map (read only when relevant)

- `.claude/knowledge/architecture.md` — layout, data flow, local vs Supabase modes
- `.claude/knowledge/business-rules.md` — calculation/filter/integrity rules
- `.claude/knowledge/auth-security.md` — PIN flow, lockout, RLS, env vars
- `.claude/knowledge/coding-standards.md` — conventions, styling/theming
- `.claude/knowledge/common-gotchas.md` — known traps

## Task playbooks (read only the matching one)

- `.claude/prompts/frontend.md` · `api.md` · `debugging.md` · `code-review.md` · `pr-review.md` · `accessibility.md` · `testing.md`

## Type/Quality review (JS)

Before completion, on changed code only: no dead code, no unused imports, PropTypes not required, named constants for repeated magic strings, handle all branches (loading/empty/error).
