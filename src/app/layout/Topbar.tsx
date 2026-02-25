import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../features/auth/store";
import { useThemeStore } from "../theme/themeStore";

export function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          Build patterns: <b>Auth</b> • <b>Server State</b> • <b>Validation</b>
        </span>
        <span
          data-spotlight="cmdk"
          className="text-xs px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
          title="Open Command Palette"
        >
          Ctrl + K
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={toggle} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </Button>

        <Button variant="ghost" onClick={() => navigate("/projects")}>
          Projects
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
