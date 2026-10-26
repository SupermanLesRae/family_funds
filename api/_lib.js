import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { lockoutStatus } from "../src/lib/lockout.js";

export const ADMIN_EMAIL = "admin@fintrack.local";

const need = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env var ${k}`);
  return v;
};
const url = () => process.env.SUPABASE_URL || need("VITE_SUPABASE_URL");
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

export const adminClient = () => createClient(url(), need("SUPABASE_SERVICE_ROLE_KEY"), opts);
export const anonClient = () =>
  createClient(url(), process.env.SUPABASE_ANON_KEY || need("VITE_SUPABASE_ANON_KEY"), opts);

// The PIN is never Supabase's password directly: server-side HMAC keeps short PINs out of its rules
// and makes a leaked auth.users row useless without PIN_PEPPER.
export const derivePassword = (pin) => createHmac("sha256", need("PIN_PEPPER")).update(pin).digest("hex");
export const initialPin = () => process.env.INITIAL_PIN || "0000";

export async function lockState(db) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data, error } = await db.from("login_attempts").select("attempted_at").gt("attempted_at", since);
  if (error) throw error;
  return lockoutStatus(data.map((r) => Date.parse(r.attempted_at)));
}
export const recordFailure = (db) => db.from("login_attempts").insert({});
export const clearFailures = (db) => db.from("login_attempts").delete().gte("id", 0);

export const sessionPayload = (data) => ({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
  mustChangePin: data.user.app_metadata?.must_change_pin === true,
});

// POST-only JSON handler; unexpected errors never leak details.
export const route = (fn) => async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  try {
    await fn(req, res);
  } catch (err) {
    console.error("api error:", err?.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
