import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store";
import { cn } from "../../lib/utils";

const Item = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2",
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-900"
      )
    }
  >
    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
    {label}
  </NavLink>
);

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="h-screen overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex flex-col">
      <div>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Logo"
          className="w-70 h-auto rounded-full"
        />
        {/* <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          juni-feup
        </div> */}
        {/* <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">Workshop</div> */}
      </div>

      <nav className="space-y-4">
        <Item to="/dashboard" label="Dashboard" />
        <div data-spotlight="projects-nav">
          <Item to="/projects" label="Projects" />
        </div>
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Signed in as</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {user?.name ?? "—"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}
