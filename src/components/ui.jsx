import { useEffect, useRef } from "react";

export const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted disabled:opacity-60";
const btn = "inline-flex items-center justify-center rounded-full px-6 py-2 text-sm min-h-11 disabled:opacity-60 disabled:cursor-not-allowed";
export const btnPrimary = `${btn} bg-cta text-cta-fg hover:bg-cta-hover`;
export const btnGhost = `${btn} bg-cta text-cta-fg hover:bg-cta-hover`;
export const btnDanger = `${btn} bg-danger text-white hover:opacity-90`;
export const cardCls = "rounded-2xl border border-border bg-surface shadow-[0_12px_30px_-14px_rgb(0_0_0/0.22)]";

// Labelled field; `children` receives the aria props to spread on the control.
export function Field({ id, label, error, hint, children }) {
  const props = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children(props)}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 p-10 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand" />
      {label}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  );
}

// Native <dialog>: focus trap, Esc, and focus restore come from the browser.
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-surface p-0 text-fg shadow-xl backdrop:bg-black/50"
    >
      <div className="max-h-[90vh] overflow-y-auto p-5">
        <h2 className="mb-4 text-lg">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", busy, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-muted">{message}</p>
      <div className="flex justify-end gap-2">
        <button type="button" className={btnGhost} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={btnDanger} onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function LocalBanner() {
  return (
    <p role="note" className="bg-warn-bg px-4 py-2 text-center text-xs text-warn-fg">
      Local development mode — data and PIN live in this browser only. Not secure and not multi-user. Configure Supabase for real use.
    </p>
  );
}
