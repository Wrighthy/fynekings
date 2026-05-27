"use client";

import { useCart } from "@/lib/store";

export default function Toast() {
  const toast = useCart(s => s.toast);
  if (!toast) return null;
  return <div className="toast show">{toast}</div>;
}