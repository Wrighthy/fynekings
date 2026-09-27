"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authStore";
import { useWishlist } from "@/lib/wishlistStore";

export function useWishlistAction() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setPendingWishlistSlug } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleWishlistClick = async (e: React.MouseEvent, targetIdOrSlug: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      setPendingWishlistSlug(targetIdOrSlug);
      const fullPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname || "/";
      router.push(`/login?redirect=${encodeURIComponent(fullPath)}`);
      return;
    }

    await toggleWishlist(targetIdOrSlug, true);
  };

  return {
    handleWishlistClick,
    isInWishlist,
    user,
  };
}
