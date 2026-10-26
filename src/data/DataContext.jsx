import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { repo } from "./index.js";
import { normalizeName, validateName } from "../lib/validation.js";

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

// table -> transaction foreign key
export const FK = { categories: "category_id", people: "person_id" };

const upsert = (list, row) => (list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? row : r)) : [...list, row]);

export function DataProvider({ children }) {
  const [state, setState] = useState({ status: "loading", error: "", transactions: [], categories: [], people: [], settings: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      setState({ status: "ready", error: "", ...(await repo.load()) });
    } catch (e) {
      setState((s) => ({ ...s, status: "error", error: e.message }));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const byId = (key) => new Map(state[key].map((r) => [r.id, r]));
    const lookups = { categories: byId("categories"), people: byId("people") };
    const persist = async (key, row) => {
      const saved = await repo.save(key, row);
      setState((s) => ({ ...s, [key]: upsert(s[key], saved) }));
      return saved;
    };
    return {
      ...state,
      reload: load,
      nameOf: (key, id) => lookups[key].get(id)?.name ?? "Unknown",
      isActive: (key, id) => lookups[key].get(id)?.is_active !== false,
      usageCount: (key, id) => state.transactions.filter((t) => t[FK[key]] === id).length,

      saveTransaction: (cleaned, id) => persist("transactions", id ? { ...cleaned, id } : cleaned),
      async deleteTransaction(id) {
        await repo.remove("transactions", id);
        setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
      },

      // Categories / people. Throws Error(message) for the caller to show.
      async saveName(key, name, id) {
        const err = validateName(name, state[key], id);
        if (err) throw new Error(err);
        return persist(key, id ? { id, name: normalizeName(name) } : { name: normalizeName(name), is_active: true });
      },
      setActive: (key, id, is_active) => persist(key, { id, is_active }),
      async deleteName(key, id) {
        if (state.transactions.some((t) => t[FK[key]] === id)) {
          throw new Error("Has transactions — deactivate it instead.");
        }
        await repo.remove(key, id);
        setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id) }));
      },

      async saveSettings(patch) {
        const saved = await repo.saveSettings({ ...state.settings, ...patch });
        setState((s) => ({ ...s, settings: saved }));
      },
    };
  }, [state, load]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
