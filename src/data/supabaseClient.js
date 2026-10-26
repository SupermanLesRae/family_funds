import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, USE_SUPABASE } from "../lib/config.js";

// null in local mode (no Supabase env) — only the Supabase repo/auth touch it.
export const supabase = USE_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
