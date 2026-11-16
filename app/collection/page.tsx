import { Suspense } from "react";
import WatchCatalog from "@/components/catalog/WatchCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Collection | FYNEKINGS Lagos Horology",
  description:
    "Explore the complete collection of FYNEKINGS luxury timepieces. Hand-finished mechanical and quartz watches designed in Lagos.",
};

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: "var(--black)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--gold)", fontSize: "15px", letterSpacing: ".12em", textTransform: "uppercase" }}>
            Loading Collection...
          </p>
        </div>
      }
    >
      <WatchCatalog initialCategory="all" />
    </Suspense>
  );
}