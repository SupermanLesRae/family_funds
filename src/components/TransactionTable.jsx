import { useData } from "../data/DataContext.jsx";
import { formatDate } from "../lib/dates.js";
import { formatMoney } from "../lib/money.js";
import { cardCls } from "./ui.jsx";

const act = "rounded px-2 py-1 text-sm hover:bg-soft";

function SortHead({ label, field, sort, onSort, right }) {
  if (!onSort) return label;
  const active = sort.key === field;
  return (
    <button type="button" onClick={() => onSort(field)} className={` ${right ? "ml-auto" : ""}`} aria-label={`Sort by ${label}`}>
      {label} {active ? (sort.dir === "asc" ? "↑" : "↓") : ""}
    </button>
  );
}

export function TransactionTable({ rows, onView, onEdit, onDelete, sort, onSort }) {
  const { settings, nameOf, isActive } = useData();
  const tag = (key, id) => (
    <>
      {nameOf(key, id)}
      {!isActive(key, id) && <span className="ml-1 text-xs text-muted">(inactive)</span>}
    </>
  );
  const ariaSort = (field) => (sort?.key === field ? (sort.dir === "asc" ? "ascending" : "descending") : undefined);
  return (
    <div className={`${cardCls} overflow-x-auto`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Transactions</caption>
        <thead className="border-b border-border text-muted">
          <tr>
            <th scope="col" className="p-3" aria-sort={ariaSort("date")}><SortHead label="Date" field="date" sort={sort} onSort={onSort} /></th>
            <th scope="col" className="p-3">Description</th>
            <th scope="col" className="p-3">Person</th>
            <th scope="col" className="p-3">Category</th>
            <th scope="col" className="p-3 text-right" aria-sort={ariaSort("amount")}>
              <div className="flex"><SortHead label="Amount" field="amount" sort={sort} onSort={onSort} right /></div>
            </th>
            <th scope="col" className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="whitespace-nowrap p-3">{formatDate(t.transaction_date, settings.date_format)}</td>
              <td className="p-3">{t.description || <span className="text-muted">—</span>}</td>
              <td className="p-3">{tag("people", t.person_id)}</td>
              <td className="p-3">{tag("categories", t.category_id)}</td>
              <td className="whitespace-nowrap p-3 text-right font-medium">{formatMoney(t.amount_cents)}</td>
              <td className="whitespace-nowrap p-3 text-right">
                <button type="button" className={act} onClick={() => onView(t)} aria-label={`View ${t.description || "transaction"}`}>View</button>
                <button type="button" className={act} onClick={() => onEdit(t)} aria-label={`Edit ${t.description || "transaction"}`}>Edit</button>
                <button type="button" className={`${act} text-danger`} onClick={() => onDelete(t)} aria-label={`Delete ${t.description || "transaction"}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
