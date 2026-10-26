import { useAuth } from "../auth/AuthContext.jsx";
import { ChangePinForm } from "../components/ChangePinForm.jsx";
import { btnGhost, cardCls, LocalBanner } from "../components/ui.jsx";
import { USE_SUPABASE } from "../lib/config.js";

// Shown instead of the app until the default PIN is replaced.
export default function SetPin() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen">
      {!USE_SUPABASE && <LocalBanner />}
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
        <h1 className="text-2xl">Set a new PIN</h1>
        <p className="text-sm text-muted">You signed in with the initial setup PIN. Choose your own PIN before using the app with real financial data.</p>
        <div className={`${cardCls} p-5`}><ChangePinForm /></div>
        <div><button type="button" className={btnGhost} onClick={logout}>Log out</button></div>
      </main>
    </div>
  );
}
