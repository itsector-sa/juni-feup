import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";
export type ToastAction = { label: string; onClick: () => void };

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  action?: ToastAction;
  durationMs?: number;
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
