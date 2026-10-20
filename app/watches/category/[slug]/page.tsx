import { Suspense } from "react";
import { notFound } from "next/navigation";
import WatchCatalog from "@/components/catalog/WatchCatalog";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return {
      title: "Watches | FYNEKINGS",
    };
  }
  return {
    title: `${category.label} Watches | FYNEKINGS Lagos Horology`,
    description: category.description,
    openGraph: {
      title: `${category.label} Watches | FYNEKINGS`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
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
          <p style={{ color: "var(--gold)", fontSize: ".7rem", letterSpacing: ".3em", textTransform: "uppercase" }}>
            Loading {category.label} Collection...
          </p>
        </div>
      }
    >
      <WatchCatalog
        initialCategory={category.slug}
        categoryTitleOverride={`${category.label} Collection`}
        categoryDescriptionOverride={category.description}
      />
    </Suspense>
  );
}
