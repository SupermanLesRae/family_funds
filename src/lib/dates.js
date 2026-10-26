import { APP_TIMEZONE } from "./config.js";

// Dates are 'YYYY-MM-DD' strings (compare as strings). Never use new Date('YYYY-MM-DD') — it is UTC.
const tzFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const todayISO = (now = new Date()) => tzFormat.format(now);

const toUTC = (iso) => new Date(`${iso}T00:00:00Z`);
const toISO = (d) => d.toISOString().slice(0, 10);
export const addDays = (iso, n) => {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
};
export const weekStart = (iso) => addDays(iso, -((toUTC(iso).getUTCDay() + 6) % 7)); // Monday
const monthStart = (iso) => `${iso.slice(0, 7)}-01`;
const addMonths = (iso, n) => {
  const d = toUTC(monthStart(iso));
  d.setUTCMonth(d.getUTCMonth() + n);
  return toISO(d);
};
// Salary day clamped to the month's length (31 -> 28/29/30 where needed).
const dayInMonth = (monthIso, day) => {
  const last = Number(monthEnd(monthIso).slice(8));
  return `${monthIso.slice(0, 7)}-${String(Math.min(day, last)).padStart(2, "0")}`;
};
// Pay period containing `iso`: salary date -> day before next salary date. salaryDay 1 = calendar month.
export function payPeriod(iso, salaryDay = 1) {
  const thisStart = dayInMonth(iso, salaryDay);
  const from = iso >= thisStart ? thisStart : dayInMonth(addMonths(iso, -1), salaryDay);
  const to = addDays(dayInMonth(addMonths(from, 1), salaryDay), -1);
  return { from, to };
}
const monthEnd = (iso) => addDays(addMonths(iso, 1), -1);

export const RANGES = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
  { key: "all_time", label: "All Time" },
  { key: "custom", label: "Custom Range" },
];
export const rangeLabel = (key) => RANGES.find((r) => r.key === key)?.label ?? "All Time";

// Inclusive { from, to }; null = unbounded.
export function getRange(key, today = todayISO(), custom = {}, salaryDay = 1) {
  switch (key) {
    case "today":
      return { from: today, to: today };
    case "this_week": {
      const from = weekStart(today);
      return { from, to: addDays(from, 6) };
    }
    case "this_month":
      return payPeriod(today, salaryDay);
    case "last_month":
      return payPeriod(addDays(payPeriod(today, salaryDay).from, -1), salaryDay);
    case "this_year":
      return { from: `${today.slice(0, 4)}-01-01`, to: `${today.slice(0, 4)}-12-31` };
    case "custom":
      return { from: custom.from || null, to: custom.to || null };
    default:
      return { from: null, to: null };
  }
}

export const DATE_FORMATS = ["DD/MM/YYYY", "YYYY-MM-DD", "D MMM YYYY"];

export function formatDate(iso, pattern = "DD/MM/YYYY") {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (pattern === "YYYY-MM-DD") return iso;
  if (pattern === "D MMM YYYY") return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
  return `${d}/${m}/${y}`;
}

// Time-series buckets
export const GRANULARITIES = ["day", "week", "month"];
export const bucketStart = (iso, g) => (g === "week" ? weekStart(iso) : g === "month" ? monthStart(iso) : iso);
export const nextBucket = (iso, g) => (g === "week" ? addDays(iso, 7) : g === "month" ? addMonths(iso, 1) : addDays(iso, 1));
export const bucketLabel = (iso, g) =>
  g === "month" ? `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : `${Number(iso.slice(8))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
