# Prompt: Accessibility

Every screen must be usable by keyboard and screen reader.

## Check
- Semantic HTML first; ARIA only to fill gaps.
- All inputs labelled; errors rendered beside the field and linked with `aria-describedby`, `aria-invalid`.
- Modals use native `<dialog>` (`showModal`) — focus trapped, Esc closes, focus restored.
- Toasts: `role="status"`/`aria-live`; login errors `role="alert"`.
- Visible focus rings; touch targets ≥ 40px on mobile; no colour-only status cues; charts have a text alternative (ranked list / table).
- Contrast in both light and dark themes.
