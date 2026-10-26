"use client";

import { useAuth } from "@/lib/authStore";
import { useWishlist } from "@/lib/wishlistStore";

export function useWishlistAction() {
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleWishlistClick = async (e: React.MouseEvent, targetIdOrSlug: string) => {
    e.stopPropagation();
    e.preventDefault();

    // Toggle wishlist directly in local storage for guests, and sync with server if authenticated
    await toggleWishlist(targetIdOrSlug, !!user);
  };

  return {
    handleWishlistClick,
    isInWishlist,
    user,
  };
}
