---
description: Review current-branch changes against a base branch using the pr-review playbook
argument-hint: "[base-branch] (default: main)"
---

Review my current branch's changes against the base branch **$ARGUMENTS** using the `.claude/prompts/pr-review.md` playbook. If no base branch was given above, use `main`.

Do this:

1. Read `.claude/prompts/pr-review.md` completely and follow it.
2. Determine the diff: `git diff <base>...HEAD` plus any uncommitted working-tree changes. State which base branch you used.
3. Apply the pr-review checklist across the whole diff (architecture/layering, React re-render cost & hook correctness, context/reducer state, ApiResult/Zod/v1-v2 gating, flags, tests, security, a11y, type safety).
4. Report prioritised, actionable findings **Critical → Low**, each with `file:line` and rationale.
