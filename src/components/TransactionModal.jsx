import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../data/DataContext.jsx";
import { centsToInput, formatMoney } from "../lib/money.js";
import { formatDate, todayISO } from "../lib/dates.js";
import { validateTransaction } from "../lib/validation.js";
import { btnGhost, btnPrimary, Field, inputCls, Modal } from "./ui.jsx";
import { useToast } from "./Toast.jsx";

const FIELD_ORDER = ["amount", "category_id", "person_id", "description", "transaction_date", "notes"];

// mode: 'create' | 'edit' | 'view'
export function TransactionModal({ mode, transaction, onClose, onEdit }) {
  const { categories, people, settings, nameOf, saveTransaction } = useData();
  const toast = useToast();
  const [v, setV] = useState({
    amount: transaction ? centsToInput(transaction.amount_cents) : "",
    category_id: transaction?.category_id ?? "",
    person_id: transaction?.person_id ?? "",
    description: transaction?.description ?? "",
    transaction_date: transaction?.transaction_date ?? todayISO(),
    notes: transaction?.notes ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  if (mode === "view") {
    const rows = [
      ["Amount", formatMoney(transaction.amount_cents)],
      ["Category", nameOf("categories", transaction.category_id)],
      ["Person", nameOf("people", transaction.person_id)],
      ["Description", transaction.description || "—"],
      ["Date", formatDate(transaction.transaction_date, settings.date_format)],
      ["Notes", transaction.notes || "—"],
    ];
    return (
      <Modal title="Transaction" onClose={onClose}>
        <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
          {rows.map(([k, val]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="whitespace-pre-wrap break-words">{val}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>Close</button>
          <button type="button" className={btnPrimary} onClick={() => onEdit(transaction)}>Edit</button>
        </div>
      </Modal>
    );
  }

  // Active items only, plus the current value when editing so history stays representable.
  const options = (list, current) => list.filter((r) => r.is_active || r.id === current);
  const noOptions = !options(categories, v.category_id).length || !options(people, v.person_id).length;

  async function submit(e) {
    e.preventDefault();
    if (busy.current) return; // block duplicate submissions
    const { errors: errs, cleaned } = validateTransaction(v);
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) return document.getElementById(`t-${first}`)?.focus();
    busy.current = true;
    setSaving(true);
    setFormError("");
    try {
      await saveTransaction(cleaned, transaction?.id);
      toast(mode === "edit" ? "Transaction updated." : "Transaction saved.");
      onClose();
    } catch (err) {
      setFormError(err.message);
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <Modal title={mode === "edit" ? "Edit spending" : "Insert spending"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-3">
        {noOptions && (
          <p className="rounded-lg bg-warn-bg p-2 text-xs text-warn-fg">
            Add at least one active category and person in <Link className="underline" to="/settings" onClick={onClose}>Settings</Link> first.
          </p>
        )}
        <Field id="t-amount" label="Amount (ZAR)" error={errors.amount}>
          {(p) => <input {...p} className={inputCls} inputMode="decimal" autoComplete="off" placeholder="850.00" value={v.amount} onChange={set("amount")} autoFocus />}
        </Field>
        <Field id="t-category_id" label="Category" error={errors.category_id}>
          {(p) => (
            <select {...p} className={inputCls} value={v.category_id} onChange={set("category_id")}>
              <option value="">Select a category</option>
              {options(categories, v.category_id).map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? "" : " (inactive)"}</option>)}
            </select>
          )}
        </Field>
        <Field id="t-person_id" label="Person (who it was spent on)" error={errors.person_id}>
          {(p) => (
            <select {...p} className={inputCls} value={v.person_id} onChange={set("person_id")}>
              <option value="">Select a person</option>
              {options(people, v.person_id).map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? "" : " (inactive)"}</option>)}
            </select>
          )}
        </Field>
        <Field id="t-description" label="Description (optional)" error={errors.description} hint="What was bought, e.g. Weekly groceries.">
          {(p) => <input {...p} className={inputCls} maxLength={200} value={v.description} onChange={set("description")} />}
        </Field>
        <Field id="t-transaction_date" label="Date" error={errors.transaction_date}>
          {(p) => <input {...p} type="date" className={inputCls} value={v.transaction_date} onChange={set("transaction_date")} />}
        </Field>
        <Field id="t-notes" label="Notes (optional)" error={errors.notes}>
          {(p) => <textarea {...p} rows={2} className={inputCls} maxLength={1000} value={v.notes} onChange={set("notes")} />}
        </Field>
        {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
