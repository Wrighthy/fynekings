"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CompareItem = {
  id: string;
  name: string;
  slug: string;
  series: string;
  price: number;
  strapColor: string;
  caseColor: string;
  caseStroke: string;
  images: string[];
  specs: Record<string, string> | null;
};

type CompareStore = {
  items: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  toggleCompare: (item: CompareItem) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
};

export const useCompare = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCompare: (item) => {
        const current = get().items;
        if (current.length >= 4) return; // max 4 items
        if (!current.some((i) => i.id === item.id)) {
          set({ items: [...current, item] });
        }
      },
      removeFromCompare: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      toggleCompare: (item) => {
        if (get().isInCompare(item.id)) {
          get().removeFromCompare(item.id);
        } else {
          get().addToCompare(item);
        }
      },
      isInCompare: (id) => get().items.some((i) => i.id === id),
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: "fynekings-compare",
    }
  )
);
