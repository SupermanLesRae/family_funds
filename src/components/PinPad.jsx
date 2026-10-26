import { useState } from "react";
import { btnPrimary, inputCls } from "./ui.jsx";

const key = "min-h-12 rounded-lg border border-border bg-surface text-lg font-medium hover:bg-soft disabled:opacity-60";

export function PinPad({ onSubmit, error, busy }) {
  const [pin, setPin] = useState("");
  const add = (d) => setPin((p) => (p.length < 8 ? p + d : p));
  const submit = (e) => {
    e.preventDefault();
    if (pin && !busy) onSubmit(pin).finally(() => setPin(""));
  };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label htmlFor="pin" className="mb-1 block text-sm font-medium">PIN</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "pin-err" : undefined}
          className={`${inputCls} text-center text-xl tracking-[0.5em]`}
          autoFocus
        />
      </div>
      {error && <p id="pin-err" role="alert" className="text-center text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        {"123456789".split("").map((d) => (
          <button key={d} type="button" className={key} onClick={() => add(d)}>{d}</button>
        ))}
        <button type="button" className={key} onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete last digit">⌫</button>
        <button type="button" className={key} onClick={() => add("0")}>0</button>
        <button type="submit" className={`${btnPrimary} min-h-12`} disabled={busy || !pin}>{busy ? "…" : "Enter"}</button>
      </div>
    </form>
  );
}
