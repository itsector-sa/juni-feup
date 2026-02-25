import type React from "react";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid place-items-center shadow-soft">
        {icon}
      </div>
      <div className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">{title}</div>
      {description && (
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</div>
      )}
      {ctaLabel && onCta && (
        <div className="mt-4">
          <Button onClick={onCta}>{ctaLabel}</Button>
        </div>
      )}
    </div>
  );
}
