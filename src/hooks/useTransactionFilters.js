import { useMemo, useState } from "react";
import { useData } from "../data/DataContext.jsx";
import { applyFilters } from "../lib/aggregate.js";
import { getRange, todayISO } from "../lib/dates.js";

// Shared by Dashboard and Transactions so both use identical filtering.
export function useTransactionFilters() {
  const { transactions, settings } = useData();
  const initial = { range: settings.default_range || "this_month", from: "", to: "", categoryId: "", personId: "", search: "" };
  const [filters, setFilters] = useState(initial);
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const reset = () => setFilters(initial);

  const range = useMemo(
    () => getRange(filters.range, todayISO(), { from: filters.from, to: filters.to }, settings.salary_day ?? 1),
    [filters.range, filters.from, filters.to, settings.salary_day],
  );
  const filtered = useMemo(
    () => applyFilters(transactions, { ...range, categoryId: filters.categoryId, personId: filters.personId, search: filters.search }),
    [transactions, range, filters.categoryId, filters.personId, filters.search],
  );
  return { filters, set, reset, range, filtered };
}
