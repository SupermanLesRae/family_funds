#!/usr/bin/env python3
"""UserPromptSubmit hook: capture messages that look like test issue reports.

Writes a redacted copy to .claude/user/captures/YYYY-MM-DD.md and tells Claude
to log it properly with the issue-log skill. Never blocks the prompt.
Pause: touch .claude/user/.paused   Resume: rm .claude/user/.paused
"""
import datetime as dt
import json
import os
import re
import sys

KEYWORDS = re.compile(
    r"\b(error|errors|bug|bugs|broken|crash\w*|fail\w*|exception|not working|"
    r"doesn'?t work|isn'?t working|wrong|stuck|hangs?|blank screen|white screen|"
    r"spinner|loading forever|regression|timeout|undefined|500|401|403|404)\b",
    re.IGNORECASE,
)
PREFIX = re.compile(r"^\s*(bug|issue|error|test)\s*:", re.IGNORECASE)

REDACTIONS = [
    (re.compile(r"\b(?:\d[ -]?){13,19}\b"), "[REDACTED-NUMBER]"),  # card / ID numbers
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[REDACTED-EMAIL]"),
    (re.compile(r"(?i)\b(bearer|token|api[_-]?key|password|secret|cvv|pin)\b\s*[:=]?\s*\S+"),
     r"\1 [REDACTED]"),
]


def redact(text: str) -> str:
    for pattern, repl in REDACTIONS:
        text = pattern.sub(repl, text)
    return text


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    prompt = (data.get("prompt") or "").strip()
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    user_dir = os.path.join(root, ".claude", "user")

    if not prompt or prompt.startswith("/") or os.path.exists(os.path.join(user_dir, ".paused")):
        return
    prefixed = bool(PREFIX.match(prompt))
    matches = sorted({m.lower() for m in KEYWORDS.findall(prompt)})
    if not prefixed and not matches:
        return

    now = dt.datetime.now()
    day, time = now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")
    cap_id = now.strftime("CAP-%Y%m%d-%H%M%S")
    cap_dir = os.path.join(user_dir, "captures")
    os.makedirs(cap_dir, exist_ok=True)
    cap_file = os.path.join(cap_dir, f"{day}.md")

    new_file = not os.path.exists(cap_file)
    quoted = "\n".join("  > " + line for line in redact(prompt)[:1500].splitlines())
    with open(cap_file, "a", encoding="utf-8") as fh:
        if new_file:
            fh.write(f"# Raw captures — {day}\n\nAuto-captured by the issue monitor hook. "
                     "Structured issues live in ../" + day + ".md\n\n")
        fh.write(f"- **{cap_id}** · {time} · session {str(data.get('session_id', ''))[:8]} · "
                 f"matched: {'prefix' if prefixed else ', '.join(matches)}\n{quoted}\n\n")

    context = (
        f"[issue-monitor] This message may be a test issue report "
        f"(matched: {'prefix' if prefixed else ', '.join(matches)}). Captured as {cap_id} "
        f"at {day} {time} in .claude/user/captures/{day}.md. If the user is reporting a real "
        f"problem they hit while testing, log it with the issue-log skill in "
        f".claude/user/{day}.md using this timestamp and capture id. If it is a normal "
        f"development request, ignore this note and do not mention it."
    )
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit",
                                             "additionalContext": context}}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass  # never block the user's prompt
    sys.exit(0)
