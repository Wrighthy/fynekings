"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  country?: string | null;
};

type AuthStore = {
  user: AuthUser | null;
  authOpen: boolean;
  authMode: "login" | "register";
  setUser: (user: AuthUser | null) => void;
  setAuthOpen: (open: boolean, mode?: "login" | "register") => void;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  authOpen: false,
  authMode: "login",
  setUser: (user) => set({ user }),
  setAuthOpen: (open, mode = "login") => set({ authOpen: open, authMode: mode }),
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({ user: null, authOpen: false });
  },
}));
