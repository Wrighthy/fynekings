"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authStore";

// Validates that redirect paths are strictly relative/internal (mitigating open-redirect vulnerabilities)
export function sanitizeRedirectUrl(url: string | null | undefined, fallback = "/account"): string {
  if (!url) return fallback;
  const decoded = decodeURIComponent(url).trim();
  if (decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.includes("://")) {
    return decoded;
  }
  return fallback;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requireInnerCircle?: boolean;
}

function LoadingShield() {
  return (
    <div
      style={{
        background: "var(--black)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Raleway, sans-serif",
        color: "var(--gold)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid var(--gold-border)",
          borderTopColor: "var(--gold)",
          animation: "spin 1s linear infinite",
          marginBottom: "24px",
        }}
      />
      <div
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "1.1rem",
          letterSpacing: ".15em",
          color: "var(--gold)",
          textTransform: "uppercase",
        }}
      >
        FYNEKINGS
      </div>
      <div
        style={{
          fontSize: "14px",
          letterSpacing: ".2em",
          color: "var(--muted)",
          marginTop: "8px",
          textTransform: "uppercase",
        }}
      >
        Verifying Client Credentials...
      </div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function ProtectedRouteInternal({
  children,
  fallbackUrl = "/login",
  requireInnerCircle = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading, isInitialized, refreshUser } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (!isInitialized) {
        await refreshUser();
      }
      if (mounted) {
        setChecking(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [isInitialized, refreshUser]);

  useEffect(() => {
    if (!checking && !isLoading) {
      if (!user) {
        const fullPath = searchParams?.toString()
          ? `${pathname}?${searchParams.toString()}`
          : pathname;
        const redirectParam = encodeURIComponent(fullPath);
        router.replace(`${fallbackUrl}?redirect=${redirectParam}`);
      }
    }
  }, [user, checking, isLoading, router, pathname, searchParams, fallbackUrl]);

  if (checking || isLoading || !user) {
    return <LoadingShield />;
  }

  return <>{children}</>;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <Suspense fallback={<LoadingShield />}>
      <ProtectedRouteInternal {...props} />
    </Suspense>
  );
}

