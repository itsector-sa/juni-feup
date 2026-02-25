import * as Cmdk from "cmdk";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store";

type Cmd = { id: string; title: string; keywords: string; run: () => void };

export function CommandPalette({
  open,
  onOpenChange,
  onNewProject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNewProject: () => void;
}) {
  const nav = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [value, setValue] = React.useState("");

  const cmds: Cmd[] = [
    {
      id: "dash",
      title: "Go to Dashboard",
      keywords: "dashboard home g d gd",
      run: () => nav("/dashboard"),
    },
    {
      id: "projects",
      title: "Go to Projects",
      keywords: "projects list crud g p gp",
      run: () => nav("/projects"),
    },
    {
      id: "new",
      title: "New Project",
      keywords: "new create project np",
      run: () => onNewProject(),
    },
    { id: "logout", title: "Logout", keywords: "sign out exit lo", run: () => logout() },
  ];

  const filtered = cmds.filter((c) =>
    (c.title + " " + c.keywords).toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Cmdk.Command.Dialog open={open} onOpenChange={onOpenChange} label="Command Palette">
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
        <div className="relative mx-auto mt-28 w-[720px] max-w-[95vw] rounded-2xl border bg-white dark:bg-slate-950 shadow-soft overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <Cmdk.Command.Input
              value={value}
              onValueChange={setValue}
              placeholder="Type a command… (try: g d, g p, new project)"
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>

          <Cmdk.Command.List className="max-h-[320px] overflow-auto p-2">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-slate-600 dark:text-slate-300">No results.</div>
            )}

            {filtered.map((c) => (
              <Cmdk.Command.Item
                key={c.id}
                value={c.title}
                onSelect={() => {
                  c.run();
                  setValue("");
                  onOpenChange(false);
                }}
                className="px-3 py-2 rounded-xl text-sm cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {c.title}
              </Cmdk.Command.Item>
            ))}
          </Cmdk.Command.List>

          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Enter to select • Esc to close</span>
            <span>Try: “g d”, “g p”, “new project”</span>
          </div>
        </div>
      </div>
    </Cmdk.Command.Dialog>
  );
}
