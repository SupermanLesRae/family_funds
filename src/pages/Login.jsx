import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { PinPad } from "../components/PinPad.jsx";
import { cardCls, LocalBanner } from "../components/ui.jsx";
import { USE_SUPABASE } from "../lib/config.js";

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(pin) {
    setBusy(true);
    setError("");
    try {
      await login(pin);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      {!USE_SUPABASE && <LocalBanner />}
      <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12">
        <header className="text-center">
          <h1 className="text-4xl">FamilyFunds</h1>
          <p className="mt-2 text-sm text-muted">Enter your PIN to continue.</p>
        </header>
        <div className={`${cardCls} p-5`}>
          <PinPad onSubmit={onSubmit} error={error} busy={busy} />
        </div>
      </main>
    </div>
  );
}
