import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useToastStore } from "../../app/toast/toastStore";
import { fireConfettiOnce } from "../../lib/confetti";
import { loginApi } from "./api";
import type { User } from "./schemas";

type AuthState = {
  token: string | null;
  user: User | null;
  hasSeenConfetti: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasSeenConfetti: false,

      login: async (email, password) => {
        const toast = useToastStore.getState().push;
        const { token, user } = await loginApi({ email, password });

        set({ token, user });
        toast({ kind: "success", title: "Welcome back", message: user.name });

        if (!get().hasSeenConfetti) {
          fireConfettiOnce();
          set({ hasSeenConfetti: true });
        }
      },

      logout: () => {
        const toast = useToastStore.getState().push;
        set({ token: null, user: null });
        toast({ kind: "info", title: "Logged out" });
      },
    }),
    {
      name: "auth:v2",
      partialize: (s) => ({ token: s.token, user: s.user, hasSeenConfetti: s.hasSeenConfetti }),
    }
  )
);
