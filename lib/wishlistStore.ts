"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistStore = {
  items: string[]; // array of product IDs or slugs
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (id) => {
        if (!get().items.includes(id)) {
          set({ items: [...get().items, id] });
        }
      },
      removeFromWishlist: (id) => {
        set({ items: get().items.filter((item) => item !== id) });
      },
      toggleWishlist: (id) => {
        if (get().items.includes(id)) {
          get().removeFromWishlist(id);
        } else {
          get().addToWishlist(id);
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
