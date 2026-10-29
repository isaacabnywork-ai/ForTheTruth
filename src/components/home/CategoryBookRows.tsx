import { BookRow } from "@/components/products/BookRow";
import type { Product } from "@/types/product";

export interface CategoryRowConfig {
  title: string;
  slug: string;
  viewMoreHref: string;
  badge?: string;
  ids: number[];
}

export const CATEGORY_ROWS_CONFIG: CategoryRowConfig[] = [
  {
    title: "The Bible Speaks Today",
    slug: "bible-speaks-today",
    viewMoreHref: "/categories/bible-commentary",
    badge: "THE BIBLE SPEAKS TODAY",
    ids: [36313, 36309, 36306, 36302, 36294, 36285],
  },
  {
    title: "Christian Living",
    slug: "christian-living",
    viewMoreHref: "/categories/christian-living",
    badge: "CHRISTIAN LIVING",
    ids: [38336, 31266, 46237, 38662, 4793, 53424],
  },
  {
    title: "Ministry",
    slug: "ministry",
    viewMoreHref: "/categories/ministry",
    badge: "MINISTRY",
    ids: [44354, 14694, 22394, 14678, 14669, 4958],
  },
  {
    title: "Theology",
    slug: "theology",
    viewMoreHref: "/categories/theology",
    badge: "THEOLOGY",
    ids: [31091, 31117, 31424, 52810, 31100, 31155],
  },
];

export interface CategoryRowItem {
  title: string;
  slug: string;
  viewMoreHref: string;
  badge?: string;
  products: Product[];
}

export function CategoryBookRows({ rows }: { rows: CategoryRowItem[] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <>
      {rows.map((row) => (
        <BookRow
          key={row.slug}
          title={row.title}
          href={row.viewMoreHref}
          badge={row.badge}
          products={row.products}
        />
      ))}
    </>
  );
}

