import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
  seen: boolean;
  step: number;
  start: () => void;
  next: (maxStep: number) => void;
  prev: () => void;
  skip: () => void; // no confetti
  complete: () => void; // completed -> micro confetti
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      seen: false,
      step: 0,
      start: () => set({ step: 0 }),
      next: (maxStep) => set({ step: Math.min(get().step + 1, maxStep) }),
      prev: () => set({ step: Math.max(get().step - 1, 0) }),
      skip: () => set({ seen: true }),
      complete: () => set({ seen: true }),
    }),
    { name: "onboarding:v3", partialize: (s) => ({ seen: s.seen }) }
  )
);
