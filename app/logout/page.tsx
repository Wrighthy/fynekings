"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authStore";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    async function performLogout() {
      await logout();
      router.replace("/");
    }
    performLogout();
  }, [logout, router]);

  return (
    <div
      style={{
        background: "var(--black)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--gold)",
        fontFamily: "Raleway, sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "1.2rem",
          letterSpacing: ".15em",
          marginBottom: "12px",
        }}
      >
        Signing out of FYNEKINGS...
      </div>
      <div style={{ fontSize: "15px", letterSpacing: ".1em", color: "var(--muted)" }}>
        Securing client session...
      </div>
    </div>
  );
}
