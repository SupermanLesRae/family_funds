import { addDays, bucketStart, nextBucket } from "./dates.js";

export function applyFilters(transactions, { from, to, categoryId, personId, search } = {}) {
  const q = (search || "").trim().toLowerCase();
  return transactions.filter(
    (t) =>
      (!from || t.transaction_date >= from) &&
      (!to || t.transaction_date <= to) &&
      (!categoryId || t.category_id === categoryId) &&
      (!personId || t.person_id === personId) &&
      (!q || `${t.description} ${t.notes}`.toLowerCase().includes(q)),
  );
}

export const sumCents = (list) => list.reduce((s, t) => s + t.amount_cents, 0);
// Salary minus spending, in cents; may be negative (overspent).
export const remainingCents = (salaryCents, spentCents) => salaryCents - spentCents;
export const percentOf = (part, total) => (total > 0 ? (part / total) * 100 : 0);

// [{ id, total, count, percent }] sorted by total desc. key: 'category_id' | 'person_id'
export function rankBy(list, key) {
  const grand = sumCents(list);
  const map = new Map();
  for (const t of list) {
    const e = map.get(t[key]) || { id: t[key], total: 0, count: 0 };
    e.total += t.amount_cents;
    e.count += 1;
    map.set(t[key], e);
  }
  return [...map.values()]
    .map((e) => ({ ...e, percent: percentOf(e.total, grand) }))
    .sort((a, b) => b.total - a.total);
}

// Zero-filled series so gaps don't mislead.
export function timeSeries(list, granularity) {
  if (!list.length) return [];
  const totals = new Map();
  for (const t of list) {
    const k = bucketStart(t.transaction_date, granularity);
    totals.set(k, (totals.get(k) || 0) + t.amount_cents);
  }
  const keys = [...totals.keys()].sort();
  const out = [];
  for (let k = keys[0]; k <= keys[keys.length - 1]; k = nextBucket(k, granularity)) {
    out.push({ bucket: k, total: totals.get(k) || 0 });
  }
  return out;
}

// One entry per day from..to inclusive, zero-filled. [{ date, total }]
export function dailySeries(list, from, to) {
  const totals = new Map();
  for (const t of list) totals.set(t.transaction_date, (totals.get(t.transaction_date) || 0) + t.amount_cents);
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push({ date: d, total: totals.get(d) || 0 });
  return out;
}

export function sortTransactions(list, sortKey, dir) {
  const sign = dir === "asc" ? 1 : -1;
  const field = sortKey === "amount" ? "amount_cents" : "transaction_date";
  return [...list].sort(
    (a, b) =>
      sign * (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0) ||
      (a.created_at < b.created_at ? 1 : -1),
  );
}
