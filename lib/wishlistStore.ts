"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistStore = {
  items: string[]; // array of product IDs or slugs
  syncWithServer: () => Promise<void>;
  addToWishlist: (id: string, isAuthenticated?: boolean) => Promise<void>;
  removeFromWishlist: (id: string, isAuthenticated?: boolean) => Promise<void>;
  toggleWishlist: (id: string, isAuthenticated?: boolean) => Promise<boolean>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      syncWithServer: async () => {
        try {
          const res = await fetch("/api/wishlist", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) {
              const serverSlugsAndIds = data.items.map((item: { productId: string; product?: { slug?: string } }) =>
                item.product?.slug || item.productId
              );
              const combined = Array.from(new Set([...get().items, ...serverSlugsAndIds]));
              set({ items: combined });
            }
          }
        } catch {
          // offline or unauthenticated, ignore
        }
      },

      addToWishlist: async (id, isAuthenticated = false) => {
        if (!get().items.includes(id)) {
          set({ items: [...get().items, id] });
        }
        if (isAuthenticated) {
          try {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug: id, productId: id }),
            });
          } catch {
            // ignore network error, keep in local state
          }
        }
      },

      removeFromWishlist: async (id, isAuthenticated = false) => {
        set({ items: get().items.filter((item) => item !== id) });
        if (isAuthenticated) {
          try {
            await fetch(`/api/wishlist?slug=${encodeURIComponent(id)}`, {
              method: "DELETE",
            });
          } catch {
            // ignore
          }
        }
      },

      toggleWishlist: async (id, isAuthenticated = false) => {
        const isPresent = get().items.includes(id);
        if (isPresent) {
          await get().removeFromWishlist(id, isAuthenticated);
          return false;
        } else {
          await get().addToWishlist(id, isAuthenticated);
          return true;
        }
      },

      isInWishlist: (id) => get().items.includes(id),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "fynekings-wishlist",
    }
  )
);

