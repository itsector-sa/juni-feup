import type React from "react";
import { cn } from "../../lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border px-3 py-2 text-sm outline-none",
        "bg-white dark:bg-slate-950",
        "border-slate-200 dark:border-slate-800",
        "text-slate-900 dark:text-slate-100",
        "focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 focus:border-slate-300 dark:focus:border-slate-700",
        props.className
      )}
    />
  );
}
