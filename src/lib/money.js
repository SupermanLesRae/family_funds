// All amounts are integer cents. Convert only at the UI edge.
export const MAX_CENTS = 9_999_999_999;

export function formatMoney(cents) {
  const n = Math.round(Number(cents) || 0);
  const abs = Math.abs(n);
  const rand = String(Math.trunc(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n < 0 ? "-" : ""}R ${rand}.${String(abs % 100).padStart(2, "0")}`;
}

// "850", "850.5", "R 850.50" -> cents; null when invalid.
export function parseMoneyToCents(input) {
  const s = String(input ?? "").trim().replace(/^R\s*/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [rand, frac = ""] = s.split(".");
  const cents = Number(rand) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export const centsToInput = (cents) => `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
