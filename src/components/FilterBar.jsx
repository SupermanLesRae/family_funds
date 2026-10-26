import { useData } from "../data/DataContext.jsx";
import { RANGES } from "../lib/dates.js";
import { btnGhost, cardCls, Field, inputCls } from "./ui.jsx";

export function FilterBar({ filters, set, reset, showSearch }) {
  const { categories, people } = useData();
  const label = (r) => (r.is_active ? r.name : `${r.name} (inactive)`);
  const badRange = filters.range === "custom" && filters.from && filters.to && filters.from > filters.to;
  return (
    <form className={`${cardCls} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4`} onSubmit={(e) => e.preventDefault()} aria-label="Filters">
      {showSearch && (
        <div className="sm:col-span-2 lg:col-span-4">
          <Field id="f-search" label="Search description and notes">
            {(p) => <input {...p} type="search" className={inputCls} value={filters.search} onChange={(e) => set({ search: e.target.value })} placeholder="e.g. groceries" />}
          </Field>
        </div>
      )}
      <Field id="f-range" label="Date range">
        {(p) => (
          <select {...p} className={inputCls} value={filters.range} onChange={(e) => set({ range: e.target.value })}>
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        )}
      </Field>
      <Field id="f-cat" label="Category">
        {(p) => (
          <select {...p} className={inputCls} value={filters.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{label(c)}</option>
            ))}
          </select>
        )}
      </Field>
      <Field id="f-person" label="Person">
        {(p) => (
          <select {...p} className={inputCls} value={filters.personId} onChange={(e) => set({ personId: e.target.value })}>
            <option value="">Everyone</option>
            {people.map((c) => (
              <option key={c.id} value={c.id}>{label(c)}</option>
            ))}
          </select>
        )}
      </Field>
      <div className="flex items-end">
        <button type="button" className={`${btnGhost} w-full`} onClick={reset}>Reset filters</button>
      </div>
      {filters.range === "custom" && (
        <>
          <Field id="f-from" label="From">
            {(p) => <input {...p} type="date" className={inputCls} value={filters.from} onChange={(e) => set({ from: e.target.value })} />}
          </Field>
          <Field id="f-to" label="To" error={badRange ? "End date is before the start date." : ""}>
            {(p) => <input {...p} type="date" className={inputCls} value={filters.to} onChange={(e) => set({ to: e.target.value })} />}
          </Field>
        </>
      )}
    </form>
  );
}
