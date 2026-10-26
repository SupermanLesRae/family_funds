import { supabase } from "../data/supabaseClient.js";

const stateOf = (session) => ({
  signedIn: Boolean(session),
  mustChangePin: session?.user?.app_metadata?.must_change_pin === true,
});

async function post(path, body, token) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the sign-in service. Check your connection.");
  }
  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Sign-in service unavailable. (Running locally? Use `vercel dev`.)");
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

async function adopt(json) {
  const { data, error } = await supabase.auth.setSession({
    access_token: json.access_token,
    refresh_token: json.refresh_token,
  });
  if (error) throw new Error("Could not start your session.");
  return stateOf(data.session);
}

export const remoteAuth = {
  async init() {
    const { data } = await supabase.auth.getSession();
    return stateOf(data.session);
  },
  // Notifies on sign-out from elsewhere (expired/revoked session).
  subscribe(cb) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") cb(stateOf(session));
    });
    return () => data.subscription.unsubscribe();
  },
  async login(pin) {
    return adopt(await post("/api/login", { pin }));
  },
  async changePin(currentPin, newPin) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Please sign in again.");
    return adopt(await post("/api/change-pin", { currentPin, newPin }, data.session.access_token));
  },
  async logout() {
    await supabase.auth.signOut();
  },
};
