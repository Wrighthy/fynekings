"use client";

import { create } from "zustand";

// ============ TYPES ============
export type CartCustom = {
  strapName: string;
  caseName: string;
  dialName: string;
};

export type CartItem = {
  name: string;
  series: string;
  amount: number;
  fee: number;
  custom: CartCustom | null;
};

// ============ HELPERS ============
export const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
export const paystackFee = (a: number) => Math.min(Math.round(a * 0.015 + 100), 2000);
export const BASE_PRICE = 420000;

// ============ CART STORE ============
type CartStore = {
  cart: CartItem[];
  cartOpen: boolean;
  toast: string;
  addToCart: (name: string, series: string, amount: number) => void;
  addCustomToCart: (custom: CartCustom, totalExtra: number) => void;
  removeFromCart: (i: number) => void;
  setCartOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
};

export const useCart = create<CartStore>((set) => ({
  cart: [],
  cartOpen: false,
  toast: "",
  addToCart: (name, series, amount) => {
    set((s) => ({
      cart: [...s.cart, { name, series, amount, fee: paystackFee(amount), custom: null }],
      cartOpen: true,
      toast: `${name} added to cart`,
    }));
    setTimeout(() => set({ toast: "" }), 2800);
  },
  addCustomToCart: (custom, totalExtra) => {
    const amount = BASE_PRICE + totalExtra;
    set((s) => ({
      cart: [...s.cart, { name: "Custom Fynekings", series: "Your Build", amount, fee: paystackFee(amount), custom }],
      cartOpen: true,
      toast: "Custom watch added to cart",
    }));
    setTimeout(() => set({ toast: "" }), 2800);
  },
  removeFromCart: (i) => {
    set((s) => ({ cart: s.cart.filter((_, idx) => idx !== i), toast: "Item removed" }));
    setTimeout(() => set({ toast: "" }), 2800);
  },
  setCartOpen: (open) => set({ cartOpen: open }),
  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: "" }), 2800);
  },
}));

// ============ CUSTOMIZER STORE ============
type CustomizerStore = {
  strapName: string;
  caseName: string;
  dialName: string;
  strapColor: string;
  caseStroke: string;
  strapExtra: number;
  caseExtra: number;
  dialExtra: number;
  setStrap: (color: string, name: string, extra: number) => void;
  setCase: (name: string, stroke: string, extra: number) => void;
  setDial: (name: string, extra: number) => void;
};

export const useCustomizer = create<CustomizerStore>((set) => ({
  strapName: "Midnight Black",
  caseName: "Gold PVD",
  dialName: "Sunray Black",
  strapColor: "#141414",
  caseStroke: "#C4A962",
  strapExtra: 0,
  caseExtra: 0,
  dialExtra: 0,
  setStrap: (color, name, extra) => set({ strapColor: color, strapName: name, strapExtra: extra }),
  setCase: (name, stroke, extra) => set({ caseName: name, caseStroke: stroke, caseExtra: extra }),
  setDial: (name, extra) => set({ dialName: name, dialExtra: extra }),
}));