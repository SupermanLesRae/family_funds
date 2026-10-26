export const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || "Africa/Johannesburg";
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Chosen once at build time; never switched silently at runtime.
export const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
