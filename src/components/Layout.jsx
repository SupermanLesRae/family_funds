import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { USE_SUPABASE } from "../lib/config.js";
import { LocalBanner } from "./ui.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transactions" },
  { to: "/settings", label: "Settings" },
];
const base = "rounded-lg px-3 py-2 text-sm font-medium";
const cls = ({ isActive }) => `${base} ${isActive ? "bg-brand text-brand-fg" : "text-muted hover:bg-soft"}`;
const mobileCls = ({ isActive }) => `flex min-h-14 items-center justify-center rounded-xl text-xs font-medium ${isActive ? "bg-soft text-fg" : "text-muted"}`;

export function Layout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 hidden w-56 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        <p className="mb-4 flex items-center gap-2 px-3 text-lg"><span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-fg">F</span>FamilyFunds</p>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {links.map((l) => <NavLink key={l.to} {...l} className={cls}>{l.label}</NavLink>)}
        </nav>
        <button type="button" onClick={logout} className={`${base} mt-auto text-left text-muted hover:bg-soft`}>Log out</button>
      </aside>
      <div className="pb-24 md:ml-56 md:pb-0">
        {!USE_SUPABASE && <LocalBanner />}
        <main className="mx-auto max-w-6xl p-4 md:p-8"><Outlet /></main>
      </div>
      <nav aria-label="Main" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-2xl border border-border bg-surface md:hidden">
        {links.map((l) => <NavLink key={l.to} {...l} className={mobileCls}>{l.label}</NavLink>)}
        <button type="button" onClick={logout} className={mobileCls({ isActive: false })}>Log out</button>
      </nav>
    </div>
  );
}
