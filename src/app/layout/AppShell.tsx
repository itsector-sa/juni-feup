import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CommandPalette } from "../command/CommandPalette";
import { OnboardingTour } from "../onboarding/OnboardingTour";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function useHotkey(handler: (e: KeyboardEvent) => void) {
  React.useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = React.useState(false);

  useHotkey((e) => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setCmdOpen((v) => !v);
    }
  });

  React.useEffect(() => {
    if (location.pathname === "/") navigate("/dashboard", { replace: true });
  }, [location.pathname, navigate]);

  const openNewProject = React.useCallback(() => {
    // Navigate to /projects first so the page is mounted to receive the event
    navigate("/projects", { state: { openNew: true } });
  }, [navigate]);

  return (
    <div className="h-full grid grid-cols-[260px_1fr] bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="min-w-0 flex flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 p-6 text-slate-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onNewProject={openNewProject} />
      <OnboardingTour />
    </div>
  );
}
