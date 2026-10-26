import { supabase } from "./supabaseClient.js";

const PAGE = 1000; // Supabase caps a single response at 1000 rows

async function fetchAll(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: true })
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

function friendly(error) {
  if (error.code === "23505") return new Error("That name already exists.");
  if (error.code === "23503") return new Error("This item is used by transactions. Deactivate it instead.");
  if (error.code === "42501" || error.code === "PGRST301") return new Error("Not authorised. Please sign in again.");
  return new Error(error.message || "Request failed.");
}

export const supabaseRepo = {
  async load() {
    const [transactions, categories, people, settings] = await Promise.all([
      fetchAll("transactions"),
      fetchAll("categories"),
      fetchAll("people"),
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (settings.error) throw friendly(settings.error);
    return { transactions, categories, people, settings: settings.data };
  },

  async save(table, row) {
    const { id, created_at, updated_at, ...fields } = row;
    const q = id ? supabase.from(table).update(fields).eq("id", id) : supabase.from(table).insert(fields);
    const { data, error } = await q.select().single();
    if (error) throw friendly(error);
    return data;
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw friendly(error);
  },

  async saveSettings(settings) {
    const { id, updated_at, ...fields } = settings;
    const { data, error } = await supabase.from("app_settings").update(fields).eq("id", 1).select().single();
    if (error) throw friendly(error);
    return data;
  },
};
