import { MAX_CENTS, parseMoneyToCents } from "./money.js";

export const normalizeName = (s) => String(s ?? "").trim().replace(/\s+/g, " ");
const nameKey = (s) => normalizeName(s).toLowerCase();

// Returns error text or "". `items` = existing rows; `selfId` excluded when renaming.
export function validateName(name, items, selfId) {
  const n = normalizeName(name);
  if (!n) return "Name is required.";
  if (n.length > 60) return "Name must be 60 characters or fewer.";
  if (items.some((i) => i.id !== selfId && nameKey(i.name) === nameKey(n))) return "That name already exists.";
  return "";
}

// Returns { errors, cleaned }. cleaned is only meaningful when errors is empty.
export function validateTransaction(v) {
  const errors = {};
  const cents = parseMoneyToCents(v.amount);
  if (!String(v.amount ?? "").trim()) errors.amount = "Amount is required.";
  else if (cents === null) errors.amount = "Enter a positive amount, e.g. 850 or 850.50.";
  else if (cents <= 0) errors.amount = "Amount must be greater than zero.";
  else if (cents > MAX_CENTS) errors.amount = "Amount is too large.";
  if (!v.category_id) errors.category_id = "Choose a category.";
  if (!v.person_id) errors.person_id = "Choose a person.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.transaction_date || "")) errors.transaction_date = "Choose a date.";
  if ((v.description || "").length > 200) errors.description = "Keep this under 200 characters.";
  if ((v.notes || "").length > 1000) errors.notes = "Keep this under 1000 characters.";
  return {
    errors,
    cleaned: {
      amount_cents: cents,
      category_id: v.category_id,
      person_id: v.person_id,
      description: (v.description || "").trim(),
      notes: (v.notes || "").trim(),
      transaction_date: v.transaction_date,
    },
  };
}
