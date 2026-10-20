export type CategoryItem = {
  slug: string;
  label: string;
  description: string;
  icon: string;
  tagline?: string;
};

export type PremiumSubcategoryItem = {
  slug: string;
  label: string;
  description: string;
  icon: string;
};

export const PREMIUM_SUBCATEGORIES: PremiumSubcategoryItem[] = [
  {
    slug: "premium-men",
    label: "Premium Men",
    description: "Commanding presence and masculine geometry, elevated to collector-grade finishing.",
    icon: "♦",
  },
  {
    slug: "premium-women",
    label: "Premium Women",
    description: "Radiant brilliance and graceful proportions, curated for the discerning collector.",
    icon: "◈",
  },
  {
    slug: "premium-automatic",
    label: "Premium Automatic",
    description: "Elite self-winding movements with exhibition casebacks and decorated rotors.",
    icon: "⚙",
  },
  {
    slug: "premium-chronograph",
    label: "Premium Chronograph",
    description: "Grand complication sub-dials and precision pushers in collector-grade execution.",
    icon: "⏱",
  },
  {
    slug: "limited-edition",
    label: "Limited Edition",
    description: "Strictly numbered references — each a singular expression of artisan horology.",
    icon: "✦",
  },
];

export const CATEGORIES: CategoryItem[] = [
  {
    slug: "men",
    label: "Men",
    description: "Distinguished luxury timepieces designed with commanding presence and masculine geometry.",
    icon: "♂",
    tagline: "Distinguished Horology for Men",
  },
  {
    slug: "women",
    label: "Women",
    description: "Graceful proportions, radiant dials, and hand-finished brilliance crafted for women.",
    icon: "♀",
    tagline: "Elegance & Radiant Craftsmanship",
  },
  {
    slug: "unisex",
    label: "Unisex",
    description: "Versatile, proportioned timepieces engineered to look iconic on every wrist.",
    icon: "◎",
    tagline: "Universal Elegance for Any Wrist",
  },
  {
    slug: "automatic",
    label: "Automatic",
    description: "Mechanical self-winding movements that turn wrist motion into endless precision.",
    icon: "⚙",
    tagline: "Self-Winding Mechanical Precision",
  },
  {
    slug: "quartz",
    label: "Quartz",
    description: "Battery-powered quartz movements delivering laser-sharp accuracy and slender profiles.",
    icon: "⚡",
    tagline: "High-Precision Quartz Movement",
  },
  {
    slug: "chronograph",
    label: "Chronograph",
    description: "Sub-dial complications and precision tactile pushers for measuring elapsed moments.",
    icon: "⏱",
    tagline: "Multi-Subdial Precision Timing",
  },
  {
    slug: "sport",
    label: "Sport",
    description: "Engineered for active lifestyles, resilience, high water resistance, and bold luminescent dials.",
    icon: "◈",
    tagline: "Resilient & High-Performance",
  },
  {
    slug: "classic",
    label: "Classic",
    description: "Timeless proportions, roman or minimal markers, and understated formal prestige.",
    icon: "◆",
    tagline: "Timeless Dress & Formal Heritage",
  },
  {
    slug: "new-arrivals",
    label: "New Arrivals",
    description: "The latest editions fresh from our Lagos atelier, showcasing our newest design innovations.",
    icon: "✦",
    tagline: "Fresh Atelier Creations",
  },
  {
    slug: "bestsellers",
    label: "Best Sellers",
    description: "Our most celebrated and sought-after masterpieces chosen by collectors worldwide.",
    icon: "★",
    tagline: "Most Coveted Collector Favorites",
  },
];

export const MOVEMENT_OPTIONS = [
  { id: "automatic", label: "Automatic" },
  { id: "quartz", label: "Quartz" },
  { id: "manual", label: "Manual" },
] as const;

export const STRAP_OPTIONS = [
  { id: "leather", label: "Leather" },
  { id: "stainless-steel", label: "Stainless Steel" },
  { id: "mesh", label: "Mesh" },
  { id: "rubber", label: "Rubber" },
] as const;

export const STYLE_OPTIONS = [
  { id: "dress", label: "Dress" },
  { id: "minimalist", label: "Minimalist" },
  { id: "sport", label: "Sport" },
  { id: "luxury", label: "Luxury" },
] as const;

export const PRICE_RANGES = [
  { id: "under-50k", label: "Under ₦50,000", min: 0, max: 50000 },
  { id: "50k-100k", label: "₦50,000 – ₦100,000", min: 50000, max: 100000 },
  { id: "100k-plus", label: "₦100,000+", min: 100000, max: 999999999 },
] as const;

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function isValidCategorySlug(slug: string): boolean {
  return CATEGORIES.some((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getPremiumSubcategoryBySlug(
  slug: string
): PremiumSubcategoryItem | undefined {
  return PREMIUM_SUBCATEGORIES.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );
}

export function isValidPremiumSlug(slug: string): boolean {
  return PREMIUM_SUBCATEGORIES.some(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );
}
