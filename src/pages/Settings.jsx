import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { ChangePinForm } from "../components/ChangePinForm.jsx";
import { useToast } from "../components/Toast.jsx";
import { btnGhost, btnPrimary, cardCls, ConfirmDialog, Field, inputCls } from "../components/ui.jsx";
import { useData } from "../data/DataContext.jsx";
import { DATE_FORMATS, formatDate, RANGES } from "../lib/dates.js";
import { centsToInput, MAX_CENTS, parseMoneyToCents } from "../lib/money.js";

function NameManager({ table, singular }) {
  const data = useData();
  const toast = useToast();
  const items = data[table];
  const [search, setSearch] = useState("");
  const [addValue, setAddValue] = useState("");
  const [addError, setAddError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [rowError, setRowError] = useState({ id: null, message: "" });
  const [toDelete, setToDelete] = useState(null);

  const visible = items.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()));
  const fail = (id, e) => setRowError({ id, message: e.message });

  async function add(e) {
    e.preventDefault();
    try {
      await data.saveName(table, addValue);
      setAddValue("");
      setAddError("");
      toast(`${singular} added.`);
    } catch (err) {
      setAddError(err.message);
    }
  }
  async function rename(id) {
    try {
      await data.saveName(table, editValue, id);
      setEditId(null);
      setRowError({ id: null, message: "" });
      toast(`${singular} renamed.`);
    } catch (err) {
      fail(id, err);
    }
  }
  async function toggle(item) {
    try {
      await data.setActive(table, item.id, !item.is_active);
      setRowError({ id: null, message: "" });
    } catch (err) {
      fail(item.id, err);
    }
  }
  async function remove() {
    try {
      await data.deleteName(table, toDelete.id);
      toast(`${singular} deleted.`);
    } catch (err) {
      toast(err.message, "error");
    }
    setToDelete(null);
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={add} noValidate className="flex flex-wrap items-start gap-2">
        <div className="min-w-48 flex-1">
          <Field id={`add-${table}`} label={`New ${singular.toLowerCase()}`} error={addError}>
            {(p) => <input {...p} className={inputCls} value={addValue} maxLength={60} onChange={(e) => setAddValue(e.target.value)} />}
          </Field>
        </div>
        <button type="submit" className={`${btnPrimary} mt-6`}>Add</button>
      </form>

      <Field id={`search-${table}`} label={`Search ${table === "people" ? "people" : "categories"}`}>
        {(p) => <input {...p} type="search" className={inputCls} value={search} onChange={(e) => setSearch(e.target.value)} />}
      </Field>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">{items.length === 0 ? `No ${table === "people" ? "people" : "categories"} yet.` : "No matches."}</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {visible.map((item) => {
            const used = data.usageCount(table, item.id);
            const editing = editId === item.id;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-2 p-3">
                <div className="min-w-40 flex-1">
                  {editing ? (
                    <form onSubmit={(e) => { e.preventDefault(); rename(item.id); }} className="flex gap-2">
                      <input aria-label={`Rename ${item.name}`} className={inputCls} value={editValue} maxLength={60} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                      <button type="submit" className={btnPrimary}>Save</button>
                      <button type="button" className={btnGhost} onClick={() => { setEditId(null); setRowError({ id: null, message: "" }); }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className={item.is_active ? "" : "text-muted line-through"}>{item.name}</span>
                      <span className="ml-2 text-xs text-muted">{item.is_active ? "Active" : "Inactive"} · {used} transaction{used === 1 ? "" : "s"}</span>
                    </>
                  )}
                  {rowError.id === item.id && <p role="alert" className="mt-1 text-xs text-danger">{rowError.message}</p>}
                </div>
                {!editing && (
                  <div className="flex gap-1 text-sm">
                    <button type="button" className={btnGhost} onClick={() => { setEditId(item.id); setEditValue(item.name); setRowError({ id: null, message: "" }); }}>Edit</button>
                    <button type="button" className={btnGhost} onClick={() => toggle(item)}>{item.is_active ? "Deactivate" : "Activate"}</button>
                    <button type="button" className={`${btnGhost}`} disabled={used > 0} title={used > 0 ? "Has transactions — deactivate instead" : undefined} onClick={() => setToDelete(item)}>Delete</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {toDelete && <ConfirmDialog title={`Delete ${singular.toLowerCase()}?`} message={`Delete "${toDelete.name}"? This cannot be undone.`} onConfirm={remove} onCancel={() => setToDelete(null)} />}
    </div>
  );
}

function SalaryField({ cents, day, onSave }) {
  const [dayValue, setDayValue] = useState(String(day));
  const [value, setValue] = useState(cents > 0 ? centsToInput(cents) : "");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    const parsed = value.trim() === "" ? 0 : parseMoneyToCents(value);
    if (parsed === null || parsed > MAX_CENTS) return setError("Enter a valid amount, e.g. 25000 or 25000.50.");
    setError("");
    onSave({ salary_cents: parsed, salary_day: Number(dayValue) });
  }
  return (
    <form onSubmit={submit} noValidate className="flex items-start gap-2">
      <div className="flex-1">
        <Field id="pref-salary" label="Monthly salary (R)" hint="Deducted from your spending on the dashboard." error={error}>
          {(p) => <input {...p} inputMode="decimal" className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />}
        </Field>
      </div>
      <div className="w-24">
        <Field id="pref-salary-day" label="Pay day" hint="Day of month">
          {(p) => (
            <select {...p} className={inputCls} value={dayValue} onChange={(e) => setDayValue(e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          )}
        </Field>
      </div>
      <button type="submit" className={`${btnPrimary} mt-6`}>Save</button>
    </form>
  );
}

function Preferences() {
  const { settings, saveSettings } = useData();
  const toast = useToast();
  const change = (patch) => saveSettings(patch).then(() => toast("Preferences saved."), (e) => toast(e.message, "error"));
  return (
    <div className="grid max-w-sm gap-4">
      <Field id="pref-currency" label="Currency" hint="South African rand is the only supported currency.">
        {(p) => <input {...p} className={inputCls} value="ZAR (South African rand)" disabled readOnly />}
      </Field>
      <SalaryField cents={settings.salary_cents ?? 0} day={settings.salary_day ?? 1} onSave={change} />
      <Field id="pref-date" label="Date display format">
        {(p) => (
          <select {...p} className={inputCls} value={settings.date_format} onChange={(e) => change({ date_format: e.target.value })}>
            {DATE_FORMATS.map((f) => <option key={f} value={f}>{f} — {formatDate("2026-10-26", f)}</option>)}
          </select>
        )}
      </Field>
      <Field id="pref-range" label="Default dashboard date range">
        {(p) => (
          <select {...p} className={inputCls} value={settings.default_range} onChange={(e) => change({ default_range: e.target.value })}>
            {RANGES.filter((r) => r.key !== "custom").map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        )}
      </Field>
    </div>
  );
}

const TABS = [
  { key: "categories", label: "Categories" },
  { key: "people", label: "People" },
  { key: "prefs", label: "Preferences" },
  { key: "security", label: "Security" },
];

export default function Settings() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("categories");
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl tracking-tight">Settings</h1>
      <div role="group" aria-label="Settings sections" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.key ? "bg-brand text-brand-fg" : "border border-border bg-surface"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <section className={`${cardCls} p-5`}>
        {tab === "categories" && <NameManager table="categories" singular="Category" />}
        {tab === "people" && <NameManager table="people" singular="Person" />}
        {tab === "prefs" && <Preferences />}
        {tab === "security" && (
          <div className="grid gap-6">
            <ChangePinForm />
            <div><button type="button" className={btnGhost} onClick={logout}>Log out</button></div>
          </div>
        )}
      </section>
    </div>
  );
}
