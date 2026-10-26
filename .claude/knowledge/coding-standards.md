# Coding standards

- JavaScript + JSX only. ESM. Named exports for lib/components; default export for pages and serverless handlers.
- Functional components + hooks; early returns; avoid nested ternaries.
- Files: `src/lib/*.js` pure (no React, no `import.meta` except `config.js`). Components PascalCase `.jsx`.
- Imports: relative; no path aliases.
- State: local → Context (`DataContext`, `AuthContext`, `ToastContext`). No Redux/zustand.
- Styling: Tailwind v4. Semantic tokens in `src/index.css` (`bg-bg`, `bg-surface`, `border-border`, `text-fg`, `text-muted`, `bg-brand`, `text-danger`, `bg-soft`). Dark mode = `.dark` on `<html>` swapping CSS vars — no `dark:` variants. Restrained green accent, subtle borders/shadows, no decorative animation.
- Charts: Recharts; colours via CSS vars (`var(--brand)`) or the categorical palette in `Charts.jsx`.
- Dependencies: react, react-router-dom, recharts, @supabase/supabase-js (+ vite, tailwind dev). Add nothing else without need.
- Browser storage (localStorage) only for per-viewer convenience (cached theme) and local dev mode — always in try/catch.
