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
  isInnerCircle?: boolean;
  innerCircleJoinedAt?: string | null;
  createdAt?: string;
};

type AuthStore = {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  authOpen: boolean;
  authMode: "login" | "register";
  redirectPath: string | null;
  pendingWishlistSlug: string | null;
  
  setUser: (user: AuthUser | null) => void;
  setAuthOpen: (open: boolean, mode?: "login" | "register", redirectPath?: string | null) => void;
  setRedirectPath: (path: string | null) => void;
  setPendingWishlistSlug: (slug: string | null) => void;
  refreshUser: () => Promise<AuthUser | null>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (data: { name: string; email: string; password: string; phone?: string; shippingAddress?: string; city?: string }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  joinInnerCircle: () => Promise<{ success: boolean; error?: string }>;
};

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  authOpen: false,
  authMode: "login",
  redirectPath: null,
  pendingWishlistSlug: null,

  setUser: (user) => set({ user, isLoading: false, isInitialized: true }),
  setRedirectPath: (redirectPath) => set({ redirectPath }),
  setPendingWishlistSlug: (pendingWishlistSlug) => set({ pendingWishlistSlug }),

  setAuthOpen: (open, mode = "login", redirectPath = null) => {
    set({
      authOpen: open,
      authMode: mode,
      ...(redirectPath ? { redirectPath } : {}),
    });
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data?.user) {
        set({ user: data.user, isLoading: false, isInitialized: true });
        return data.user as AuthUser;
      } else {
        set({ user: null, isLoading: false, isInitialized: true });
        return null;
      }
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
      return null;
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data?.user) {
        set({ user: data.user, authOpen: false, isLoading: false, isInitialized: true });
        return { success: true, user: data.user };
      }
      return { success: false, error: data?.error || "Invalid email or password." };
    } catch {
      return { success: false, error: "Network error during login." };
    }
  },

  signup: async (data) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData?.user) {
        set({ user: resData.user, authOpen: false, isLoading: false, isInitialized: true });
        return { success: true, user: resData.user };
      }
      return { success: false, error: resData?.error || "Failed to create account." };
    } catch {
      return { success: false, error: "Network error during registration." };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({ user: null, authOpen: false, isLoading: false });
  },

  joinInnerCircle: async () => {
    try {
      const res = await fetch("/api/inner-circle/join", { method: "POST" });
      const data = await res.json();
      if (res.ok && data?.success) {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              isInnerCircle: true,
              innerCircleJoinedAt: new Date().toISOString(),
            },
          });
        }
        return { success: true };
      }
      return { success: false, error: data?.error || "Could not enlist." };
    } catch {
      return { success: false, error: "Network error joining the Inner Circle." };
    }
  },
}));

