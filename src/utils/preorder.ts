import type { Product } from "@/types/product";

export interface PreorderInfo {
  isPreorder: boolean;
  releaseDate: Date | null;
  shippingNotice: string;
}

/**
 * Known preorder products configuration.
 * When the current time passes the releaseDate, the product automatically
 * reverts to regular in-stock behavior with standard "Add to Cart" and "Buy Now".
 */
const KNOWN_PREORDERS: Record<
  number | string,
  { releaseDateIso: string; shippingNotice: string }
> = {
  // Calendar 2027 (ID 57211)
  57211: {
    releaseDateIso: "2026-12-01T00:00:00+05:30",
    shippingNotice: "Shipping starts after 1 December",
  },
  "calendar-2027": {
    releaseDateIso: "2026-12-01T00:00:00+05:30",
    shippingNotice: "Shipping starts after 1 December",
  },
};

/**
 * Checks whether a product is currently in pre-order status.
 * Automatically checks:
 * 1. Explicit entry in KNOWN_PREORDERS (e.g. Calendar 2027 until Dec 1, 2026).
 * 2. WooCommerce product meta fields (`_preorder_status === "yes"`, `_ywpo_preorder === "yes"`).
 * 3. Compares with current date: if releaseDate has passed, isPreorder evaluates to false!
 */
export function getProductPreorderInfo(product: Product): PreorderInfo {
  const now = new Date();

  // 1. Check known preorder list (by ID or Slug)
  const known = KNOWN_PREORDERS[product.id] || KNOWN_PREORDERS[product.slug];
  if (known) {
    const releaseDate = new Date(known.releaseDateIso);
    if (now < releaseDate) {
      return {
        isPreorder: true,
        releaseDate,
        shippingNotice: known.shippingNotice,
      };
    }
  }

  // 2. Check WooCommerce meta data
  const meta = product.meta_data || [];
  const preorderStatus = meta.find(
    (m) =>
      (m.key === "_preorder_status" && m.value === "yes") ||
      (m.key === "_ywpo_preorder" && m.value === "yes")
  );

  if (preorderStatus) {
    const dateMeta = meta.find((m) =>
      /preorder.*(date|avail)/i.test(m.key)
    );
    let releaseDate: Date | null = null;
    if (dateMeta && typeof dateMeta.value === "string" && dateMeta.value.trim()) {
      const parsed = new Date(dateMeta.value);
      if (!isNaN(parsed.getTime())) {
        releaseDate = parsed;
      }
    }

    if (releaseDate && now >= releaseDate) {
      return { isPreorder: false, releaseDate, shippingNotice: "" };
    }

    return {
      isPreorder: true,
      releaseDate,
      shippingNotice: "Shipping starts after release date",
    };
  }

  return {
    isPreorder: false,
    releaseDate: null,
    shippingNotice: "",
  };
}
