import { Bookshelf } from "@/components/products/Bookshelf";
import type { Product } from "@/types/product";

export interface CategoryRowConfig {
  title: string;
  slug: string;
  viewMoreHref: string;
  ids: number[];
}

export const CATEGORY_ROWS_CONFIG: CategoryRowConfig[] = [
  {
    title: "The Bible Speaks Today",
    slug: "bible-speaks-today",
    viewMoreHref: "/categories/bible-commentary",
    ids: [36313, 36309, 36306, 36302, 36294, 36285],
  },
  {
    title: "Christian Living",
    slug: "christian-living",
    viewMoreHref: "/categories/christian-living",
    ids: [38336, 31266, 46237, 38662, 4793, 53424],
  },
  {
    title: "Ministry",
    slug: "ministry",
    viewMoreHref: "/categories/ministry",
    ids: [44354, 14694, 22394, 14678, 14669, 4958],
  },
  {
    title: "Theology",
    slug: "theology",
    viewMoreHref: "/categories/theology",
    ids: [31091, 31117, 31424, 52810, 31100, 31155],
  },
];

export interface CategoryRowItem {
  title: string;
  slug: string;
  viewMoreHref: string;
  products: Product[];
}

export function CategoryBookRows({ rows }: { rows: CategoryRowItem[] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <>
      {rows.map((row) => (
        <Bookshelf
          key={row.slug}
          title={row.title}
          href={row.viewMoreHref}
          products={row.products}
        />
      ))}
    </>
  );
}

