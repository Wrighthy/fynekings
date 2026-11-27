import { Suspense } from "react";
import WatchCatalog from "@/components/catalog/WatchCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Premium Collection | FYNEKINGS Lagos Horology",
  description:
    "Explore The Premium Collection by FYNEKINGS. Exceptional horological precision, strictly numbered editions, and elevated artisanal finishing hand-crafted in Lagos.",
  openGraph: {
    title: "The Premium Collection | FYNEKINGS Lagos Horology",
    description:
      "Haute horlogerie finishing, rare complications, and strictly curated collector references.",
  },
};

export default function PremiumCollectionPage() {
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
          <p
            style={{
              color: "var(--gold)",
              fontSize: "15px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Loading The Premium Collection...
          </p>
        </div>
      }
    >
      <WatchCatalog
        isPremiumOnly={true}
        initialPremiumCollection="all"
        categoryTitleOverride="The Premium Collection"
        categoryDescriptionOverride="Our most elevated and prestigious horological expressions. Strictly curated for connoisseurs, each reference showcases haute horlogerie finishing, precious materials, and distinguished provenance."
      />
    </Suspense>
  );
}
