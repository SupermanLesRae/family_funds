// LOCAL DEVELOPMENT MODE ONLY: data is saved to local-data/db.json via the Vite dev server (plus a localStorage fallback). Not secure, not multi-user.
const KEY = "fintrack.local.db";
const SEED_CATEGORIES = [
  "Groceries", "Transport", "Housing", "Utilities", "Medical", "Education",
  "Entertainment", "Clothing", "Personal Care", "Gifts", "Household", "Other",
];
const DEFAULT_SETTINGS = { id: 1, currency: "ZAR", date_format: "DD/MM/YYYY", theme: "light", default_range: "this_month", salary_cents: 0, salary_day: 1 };

const stamp = () => new Date().toISOString();

const DB_URL = "/__local-db"; // dev-server endpoint backed by local-data/db.json

function seed() {
  const now = stamp();
  return {
    transactions: [],
    people: [],
    categories: SEED_CATEGORIES.map((name) => ({ id: crypto.randomUUID(), name, is_active: true, created_at: now, updated_at: now })),
    settings: DEFAULT_SETTINGS,
  };
}

// In-memory copy; the JSON file is the source of truth, localStorage is a fallback cache.
let db = null;

async function readFile() {
  try {
    const res = await fetch(DB_URL);
    return res.ok ? await res.json() : null;
  } catch {
    return null; // dev endpoint unavailable (e.g. preview build)
  }
}

async function write() {
  const json = JSON.stringify(db);
  localStorage.setItem(KEY, json);
  try {
    await fetch(DB_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: json });
  } catch {
    /* file sync is best-effort; localStorage still holds the data */
  }
}

export const localRepo = {
  async load() {
    const cached = localStorage.getItem(KEY);
    db = (await readFile()) ?? (cached ? JSON.parse(cached) : seed());
    db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
    await write();
    return db;
  },

  async save(table, row) {
    const now = stamp();
    const list = db[table];
    const i = row.id ? list.findIndex((r) => r.id === row.id) : -1;
    const saved = i >= 0 ? { ...list[i], ...row, updated_at: now } : { ...row, id: crypto.randomUUID(), created_at: now, updated_at: now };
    if (i >= 0) list[i] = saved;
    else list.push(saved);
    await write();
    return saved;
  },

  async remove(table, id) {
    db[table] = db[table].filter((r) => r.id !== id);
    await write();
  },

  async saveSettings(settings) {
    db.settings = { ...db.settings, ...settings, updated_at: stamp() };
    await write();
    return db.settings;
  },
};
