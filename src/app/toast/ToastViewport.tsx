import React from "react";
import { cn } from "../../lib/utils";
import { useToastStore } from "./toastStore";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  React.useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => window.setTimeout(() => remove(t.id), t.durationMs ?? 3200));
    return () => {
      for (const x of timers) window.clearTimeout(x);
    };
  }, [toasts, remove]);

  return (
    <div className="fixed right-4 bottom-4 z-50 space-y-2 w-[380px] max-w-[92vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-2xl border bg-white dark:bg-slate-950 shadow-soft p-3",
            "border-slate-200 dark:border-slate-800",
            t.kind === "success" && "border-emerald-200 dark:border-emerald-900/40",
            t.kind === "error" && "border-rose-200 dark:border-rose-900/40"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</div>
              {t.message && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{t.message}</div>
              )}
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              onClick={() => remove(t.id)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {t.action && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="text-xs font-semibold px-3 py-1 rounded-xl border bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800"
                onClick={() => {
                  remove(t.id);
                  t.action?.onClick();
                }}
              >
                {t.action.label}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
