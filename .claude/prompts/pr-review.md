# Prompt: PR review

Review as a principal engineer focused on production quality. Complements `code-review.md` — apply that checklist across the whole diff (`git diff <base>...HEAD` + working tree).

## Focus
- Auth/RLS correctness, lockout, no PIN leakage.
- Data integrity: cents, dates (timezone), duplicate-name rules, delete safety.
- Hook correctness, re-render cost, effect dependencies.
- Vercel config (`vercel.json` rewrites, env var names), `.env.example` placeholders only.
- Accessibility and responsive behaviour.

## Output
Prioritised actionable comments (Critical → Low) with file:line.
