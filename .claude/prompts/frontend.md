# Prompt: Frontend / React work

Build or change UI using the **existing** architecture. Explore before you code.

## Before writing code
1. Read `knowledge/architecture.md` and `knowledge/coding-standards.md`.
2. Reuse first: `src/components/`, `src/lib/`, `src/data/DataContext.jsx`, `src/hooks/`.
3. Money/date/aggregation logic belongs in `src/lib/` — never inline in a component.

## Rules
- Functional components + hooks. Data via `useData()`, auth via `useAuth()`, toasts via `useToast()`.
- Mutations go through DataContext actions (they validate, call the repo, update state).
- Every screen handles loading / empty / error / success.
- Accessibility: semantic HTML, labelled inputs, errors `aria-describedby`, native `<dialog>` modals, keyboard operable.
- Tailwind semantic tokens only (`bg-surface`, `text-muted`, `bg-brand`, `text-danger`).
- Smallest diff; no unrelated rewrites.

## Output
What changed · files touched · assumptions · risks.
