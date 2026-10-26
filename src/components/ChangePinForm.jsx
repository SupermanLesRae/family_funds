import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { validateNewPin } from "../lib/pin.js";
import { btnPrimary, Field, inputCls } from "./ui.jsx";
import { useToast } from "./Toast.jsx";

const pinInput = (p, value, onChange, auto) => (
  <input {...p} type="password" inputMode="numeric" autoComplete={auto} maxLength={8} className={inputCls} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} />
);

export function ChangePinForm() {
  const { changePin } = useAuth();
  const toast = useToast();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const errs = {};
    if (!cur) errs.cur = "Enter your current PIN.";
    const policy = validateNewPin(next, cur);
    if (policy) errs.next = policy;
    if (next !== confirm) errs.confirm = "PINs do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await changePin(cur, next);
      toast("PIN changed.");
      setCur("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid max-w-sm gap-3">
      <Field id="pin-cur" label="Current PIN" error={errors.cur}>{(p) => pinInput(p, cur, setCur, "off")}</Field>
      <Field id="pin-new" label="New PIN" error={errors.next} hint="6–8 digits. No repeated digits or simple sequences.">{(p) => pinInput(p, next, setNext, "off")}</Field>
      <Field id="pin-confirm" label="Confirm new PIN" error={errors.confirm}>{(p) => pinInput(p, confirm, setConfirm, "off")}</Field>
      {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
      <div><button type="submit" className={btnPrimary} disabled={busy}>{busy ? "Saving…" : "Change PIN"}</button></div>
    </form>
  );
}
