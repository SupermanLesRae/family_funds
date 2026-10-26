---
name: issue-log
description: Use when the user reports an error, bug or issue they hit while testing the Fintrack (manually, in standalone, INT, QA or prod), when an [issue-monitor] note says a message was captured as a possible issue, or when the user asks to log, list, show, update, close or summarise test issues. Records timestamped issues in .claude/user/.
---

# issue-log — timestamped test issue log

Keeps a dated log of issues found while testing, in `.claude/user/` (git-excluded, private).

```
.claude/user/
  2026-09-30.md            ← structured issues for that test day (this skill writes these)
  captures/2026-09-30.md   ← raw, redacted messages auto-captured by the hook
  .paused                  ← if present, the hook stops capturing
```

The hook `.claude/hooks/issue-capture.py` (UserPromptSubmit, in `.claude/settings.local.json`) watches every message. When a message looks like an issue report it saves a redacted copy under `captures/` and adds an `[issue-monitor]` note with a capture id (`CAP-YYYYMMDD-HHMMSS`). The note is only a hint — decide whether it is a real test issue; ignore it for normal dev requests ("fix the errors in X", "review for bugs").

## Rules

- **Time:** always get it from `date '+%Y-%m-%d %H:%M:%S'` — never guess. If an `[issue-monitor]` note gave a timestamp, use that one.
- **No sensitive data:** never write card numbers, CVV, PINs, ID numbers, account numbers, emails, phone numbers, tokens or passwords. Replace with `[REDACTED]`. Masked PANs (`•••• 1234`) are fine.
- **Don't investigate or fix** unless the user asks. Logging is quick: write the entry, confirm, carry on.
- **Ask at most one question**, only if the issue is unusable without it (e.g. no idea which screen). Otherwise write `unknown`.
- One issue per entry. If a message reports several problems, write several entries.

## Log an issue

1. `mkdir -p .claude/user` and open `.claude/user/<YYYY-MM-DD>.md`. If new, create it with:

   ```markdown
   # Test issues — <YYYY-MM-DD>

   | ID | Time | Severity | Area | Summary | Status |
   |----|------|----------|------|---------|--------|
   ```

2. Add a row to the table and append the entry below it:

   ```markdown
   ## ISSUE-<YYYYMMDD>-<HHMMSS> — <short title>

   - **Time:** <YYYY-MM-DD HH:MM:SS>
   - **Capture:** <CAP id, or "manual">
   - **Environment:** <standalone | INT | QA | prod | unknown>
   - **Area / screen:** <e.g. Card create → Confirm order>
   - **Card / flow:** <e.g. physical credit, virtual debit, sub-user card>
   - **Severity:** 🔴 HIGH | 🟠 MEDIUM | 🟢 LOW
   - **Status:** Open

   **What happened:** <actual behaviour, the user's words tidied up>

   **Expected:** <what should have happened, or "not stated">

   **Steps:**
   1. <step>

   **Evidence:** <error text / console / network status, redacted — or "none">

   **Notes:** <suspected file:line only if already known from this session — otherwise leave blank>
   ```

   Severity: HIGH = blocks the flow, wrong data sent, crash, security/PII. MEDIUM = works with a workaround or wrong in an edge case. LOW = cosmetic / copy / minor.

3. Reply in one line: `Logged ISSUE-… (🟠 MEDIUM) in .claude/user/<date>.md`.

## Other commands

| User says | Do |
|-----------|----|
| "list issues" / "show today's issues" | Read `.claude/user/<today>.md` (or the date given); show the table of Open issues |
| "list all open issues" | Read every `.claude/user/*.md` (not `captures/`); table of Open issues, newest first |
| "close ISSUE-… [note]" | Set **Status:** Closed — <date time> — <note>, update the table row |
| "update ISSUE-… …" | Edit the fields mentioned; add `**Updated:** <date time>` |
| "issue summary" | Count by severity and status across the chosen dates |
| "review captures" | Read `captures/<today>.md`; for each capture not yet referenced by an issue, propose an entry (or skip if it was a dev request); log the ones the user confirms |
| "pause issue monitor" / "resume issue monitor" | `touch .claude/user/.paused` / `rm .claude/user/.paused` |
