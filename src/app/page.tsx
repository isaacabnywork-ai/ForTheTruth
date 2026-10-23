import { Bookshelf, BookshelfSkeleton } from "@/components/products/Bookshelf";
import { HeroShelf } from "@/components/home/HeroShelf";
import { TopicGrid } from "@/components/home/TopicGrid";
import {
  CategoryBookRows,
  CATEGORY_ROWS_CONFIG,
  type CategoryRowItem,
} from "@/components/home/CategoryBookRows";
import { Testimonials } from "@/components/home/Testimonials";
import { SpineSlider } from "@/components/home/SpineSlider";
import { isWooConfigured } from "@/config/env";
import { getCategories, getProducts } from "@/services/woocommerce";
import { getCuratedShelfConfig } from "@/services/curation";
import categoryRowsFallbackData from "@/data/category_rows_fallback.json";
import type { Product, WCCategory } from "@/types/product";

export const revalidate = 3600;

function sortByIdList(products: Product[], ids: number[]): Product[] {
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
}

export default async function HomePage() {
  let featured: Product[] = [];
  let newArrivals: Product[] = [];
  let bestsellers: Product[] = [];
  let spineProducts: Product[] = [];
  let categories: WCCategory[] = [];
  let coversByCategory: Record<number, Product[]> = {};
  let fetchedCategoryRows: Product[] = [];
  const curated = getCuratedShelfConfig();

  const allCategoryRowIds = CATEGORY_ROWS_CONFIG.flatMap((c) => c.ids);

  if (isWooConfigured()) {
    try {
      const heroQuery = curated.heroIds.length > 0 ? { include: curated.heroIds, perPage: curated.heroIds.length } : { featured: true, perPage: 9 };
      const newQuery = curated.newArrivalsIds.length > 0 ? { include: curated.newArrivalsIds, perPage: curated.newArrivalsIds.length } : { perPage: 6, orderby: "date" as const, order: "desc" as const };
      const bestQuery = curated.bestsellersIds.length > 0 ? { include: curated.bestsellersIds, perPage: curated.bestsellersIds.length } : { perPage: 6, orderby: "popularity" as const, order: "desc" as const };
      const spineQuery = curated.spineIds.length > 0 ? { include: curated.spineIds, perPage: curated.spineIds.length } : undefined;
      const categoryRowsQuery = { include: allCategoryRowIds, perPage: allCategoryRowIds.length };

      const results = await Promise.all([
        getProducts(heroQuery),
        getProducts(newQuery),
        getProducts(bestQuery),
        getCategories(),
        spineQuery ? getProducts(spineQuery) : Promise.resolve([]),
        getProducts(categoryRowsQuery),
      ]);

      featured = results[0];
      newArrivals = results[1];
      bestsellers = results[2];
      categories = results[3];
      const fetchedSpine = results[4];
      fetchedCategoryRows = results[5];

      if (curated.heroIds.length > 0) {
        featured = sortByIdList(featured, curated.heroIds);
      }
      if (featured.length < 3) {
        const extra = [...bestsellers, ...newArrivals].filter(
          (p) => !featured.some((f) => f.id === p.id)
        );
        featured = [...featured, ...extra].slice(0, 6);
      }
      if (featured.length === 0) {
        featured = await getProducts({ perPage: 9, orderby: "popularity", order: "desc" });
      }

      if (curated.newArrivalsIds.length > 0) newArrivals = sortByIdList(newArrivals, curated.newArrivalsIds);
      if (curated.bestsellersIds.length > 0) bestsellers = sortByIdList(bestsellers, curated.bestsellersIds);
      
      if (curated.spineIds.length > 0 && fetchedSpine.length > 0) {
        spineProducts = sortByIdList(fetchedSpine, curated.spineIds);
      } else {
        spineProducts = featured;
      }

      // Cover thumbnails for the topic cards
      const top = categories.slice(0, 8);
      const covers = await Promise.all(
        top.map((c) =>
          getProducts({ category: c.id, perPage: 3 }).catch(() => [])
        )
      );
      coversByCategory = Object.fromEntries(
        top.map((c, i) => [c.id, covers[i]])
      );
    } catch (err) {
      console.error("Homepage: WooCommerce fetch failed", err);
    }
  }

  // Build the 4 category rows with real or fallback data
  const productsMap = new Map<number, Product>();
  (categoryRowsFallbackData as unknown as Product[]).forEach((p) => {
    productsMap.set(p.id, p);
  });
  fetchedCategoryRows.forEach((p) => {
    productsMap.set(p.id, p);
  });

  const categoryRows: CategoryRowItem[] = CATEGORY_ROWS_CONFIG.map((cfg) => ({
    title: cfg.title,
    slug: cfg.slug,
    viewMoreHref: cfg.viewMoreHref,
    products: cfg.ids.map((id) => productsMap.get(id)).filter(Boolean) as Product[],
  }));

  const storeReady = newArrivals.length > 0 || bestsellers.length > 0;

  return (
    <>
      {/* 1 — Hero above the fold with customizable content */}
      <HeroShelf
        products={featured}
        badge={curated.heroBadge}
        title={curated.heroTitle}
        subtitle={curated.heroSubtitle}
      />

      {/* 2 — Quick browse by topic */}
      <TopicGrid categories={categories} coversByCategory={coversByCategory} />

      {/* 3 — New Arrivals Shelf */}
      {storeReady ? (
        newArrivals.length > 0 && (
          <Bookshelf
            title={curated.newArrivalsTitle || "New Arrivals"}
            href="/products?orderby=date"
            products={newArrivals}
          />
        )
      ) : (
        <BookshelfSkeleton title={curated.newArrivalsTitle || "New Arrivals"} />
      )}

      {/* 4 — 4 Categorical Rows: The Bible Speaks Today, Christian Living, Ministry, Theology */}
      <CategoryBookRows rows={categoryRows} />

      {/* 5 — Bestsellers Shelf (placed below Theology category) */}
      {storeReady ? (
        bestsellers.length > 0 && (
          <Bookshelf
            title={curated.bestsellersTitle || "Bestsellers"}
            href="/products?orderby=popularity"
            products={bestsellers}
          />
        )
      ) : (
        <BookshelfSkeleton title={curated.bestsellersTitle || "Bestsellers"} />
      )}

      {/* 6 — Explore Children Books (spine slider) with customizable titles & book selection */}
      {spineProducts.length > 0 && (
        <SpineSlider
          products={spineProducts}
          badge={curated.spineBadge || "Browse the shelf"}
          title={curated.spineTitle || "Explore Children Books"}
          subtitle={curated.spineSubtitle}
        />
      )}

      {/* 6 — Social proof */}
      <Testimonials />
    </>
  );
}
