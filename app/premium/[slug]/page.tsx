import { Suspense } from "react";
import { notFound } from "next/navigation";
import WatchCatalog from "@/components/catalog/WatchCatalog";
import {
  PREMIUM_SUBCATEGORIES,
  getPremiumSubcategoryBySlug,
} from "@/lib/categories";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PREMIUM_SUBCATEGORIES.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subCategory = getPremiumSubcategoryBySlug(slug);
  if (!subCategory) {
    return {
      title: "The Premium Collection | FYNEKINGS",
    };
  }
  return {
    title: `${subCategory.label} — The Premium Collection | FYNEKINGS`,
    description: subCategory.description,
    openGraph: {
      title: `${subCategory.label} — The Premium Collection | FYNEKINGS`,
      description: subCategory.description,
    },
  };
}

export default async function PremiumSubcategoryPage({ params }: Props) {
  const { slug } = await params;
  const subCategory = getPremiumSubcategoryBySlug(slug);

  if (!subCategory) {
    notFound();
  }

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
            Loading {subCategory.label}...
          </p>
        </div>
      }
    >
      <WatchCatalog
        isPremiumOnly={true}
        initialPremiumCollection={subCategory.slug}
        categoryTitleOverride={`${subCategory.label}`}
        categoryDescriptionOverride={subCategory.description}
      />
    </Suspense>
  );
}
