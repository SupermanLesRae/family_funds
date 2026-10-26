# Prompt: Code review

Review as a staff engineer. Justify suggestions; don't nitpick formatting.

## Check
- Business logic only in `src/lib/`; no duplicated filtering/totals between Dashboard and Transactions.
- Money as integer cents; no float math; ZAR format `R 1,234.56`.
- Repos (`supabaseRepo`/`localRepo`) stay behaviour-identical; migrations + RLS updated with schema changes.
- Security: no secrets/PINs in client code, logs, or storage; service key server-only; RLS present.
- UI: loading/empty/error/success; a11y; semantic tokens; responsive.
- Historical integrity: rename/deactivate never alters transaction links; delete guarded.
- Scope creep (budgets, exports, etc.) and unnecessary dependencies.

## Output
**Critical · High · Medium · Low**, each with file:line and rationale.
