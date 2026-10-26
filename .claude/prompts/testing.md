# Prompt: Testing

Only when explicitly requested. No test framework is installed by default.

- Prefer pure-function tests for `src/lib/*` (money, dates, aggregate, validation, pin, lockout) — highest risk, no DOM needed.
- If adding a runner, use Vitest (already Vite-native); mock the repo layer, not React.
- Cover: cents parsing/formatting edge cases, date range boundaries (month ends, week start Monday), zero-total percentages, duplicate-name normalisation, PIN policy.
