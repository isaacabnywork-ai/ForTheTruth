import { BookRow, BookRowSkeleton } from "@/components/products/BookRow";
import { HeroShelf } from "@/components/home/HeroShelf";
import { TopicGrid } from "@/components/home/TopicGrid";
import {
  CategoryBookRows,
  CATEGORY_ROWS_CONFIG,
  type CategoryRowItem,
} from "@/components/home/CategoryBookRows";
import { Testimonials } from "@/components/home/Testimonials";
import { SpineSlider } from "@/components/home/SpineSlider";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { isWooConfigured } from "@/config/env";
import { getCategories, getProducts } from "@/services/woocommerce";
import { getCuratedShelfConfig } from "@/services/curation";
import categoryRowsFallbackData from "@/data/category_rows_fallback.json";
import type { Product, WCCategory } from "@/types/product";

export const revalidate = 60;

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

  const dynamicCategoryConfigs = [
    {
      title: curated.bibleSpeaksTodayTitle || "The Bible Speaks Today",
      slug: "bible-speaks-today",
      viewMoreHref: "/categories/bible-commentary",
      badge: "BIBLE SPEAKS TODAY",
      ids:
        curated.bibleSpeaksTodayIds && curated.bibleSpeaksTodayIds.length > 0
          ? curated.bibleSpeaksTodayIds
          : [36313, 36309, 36306, 36302, 36294, 36285],
    },
    {
      title: curated.christianLivingTitle || "Christian Living",
      slug: "christian-living",
      viewMoreHref: "/categories/christian-living",
      badge: "CHRISTIAN LIVING",
      ids:
        curated.christianLivingIds && curated.christianLivingIds.length > 0
          ? curated.christianLivingIds
          : [38336, 31266, 46237, 38662, 4793, 53424],
    },
    {
      title: curated.ministryTitle || "Ministry",
      slug: "ministry",
      viewMoreHref: "/categories/ministry",
      badge: "MINISTRY",
      ids:
        curated.ministryIds && curated.ministryIds.length > 0
          ? curated.ministryIds
          : [44354, 14694, 22394, 14678, 14669, 4958],
    },
    {
      title: curated.theologyTitle || "Theology",
      slug: "theology",
      viewMoreHref: "/categories/theology",
      badge: "THEOLOGY",
      ids:
        curated.theologyIds && curated.theologyIds.length > 0
          ? curated.theologyIds
          : [31091, 31117, 31424, 52810, 31100, 31155],
    },
  ];

  const allCategoryRowIds = dynamicCategoryConfigs.flatMap((c) => c.ids);

  if (isWooConfigured()) {
    try {
      const heroQuery = curated.heroIds.length > 0 ? { include: curated.heroIds, perPage: curated.heroIds.length, revalidate: 60 } : { featured: true, perPage: 9, revalidate: 60 };
      const newQuery = curated.newArrivalsIds.length > 0 ? { include: curated.newArrivalsIds, perPage: curated.newArrivalsIds.length, revalidate: 60 } : { perPage: 6, orderby: "date" as const, order: "desc" as const, revalidate: 60 };
      const bestQuery = curated.bestsellersIds.length > 0 ? { include: curated.bestsellersIds, perPage: curated.bestsellersIds.length, revalidate: 60 } : { perPage: 6, orderby: "popularity" as const, order: "desc" as const, revalidate: 60 };
      const spineQuery = curated.spineIds.length > 0 
        ? { include: curated.spineIds, perPage: curated.spineIds.length, revalidate: 60 } 
        : { category: 114, perPage: 10, revalidate: 60 };
      const categoryRowsQuery = { include: allCategoryRowIds, perPage: allCategoryRowIds.length, revalidate: 60 };

      const results = await Promise.all([
        getProducts(heroQuery),
        getProducts(newQuery),
        getProducts(bestQuery),
        getCategories(),
        getProducts(spineQuery),
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
      } else if (fetchedSpine.length > 0) {
        spineProducts = fetchedSpine;
      } else {
        spineProducts = await getProducts({ category: 114, perPage: 10 }).catch(() => []);
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

  const categoryRows: CategoryRowItem[] = dynamicCategoryConfigs.map((cfg) => ({
    title: cfg.title,
    slug: cfg.slug,
    viewMoreHref: cfg.viewMoreHref,
    badge: cfg.badge,
    products: cfg.ids
      .map((id) => productsMap.get(id))
      .filter(Boolean) as Product[],
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

      {/* 3 — New Arrivals */}
      {storeReady ? (
        newArrivals.length > 0 && (
          <BookRow
            title={curated.newArrivalsTitle || "New Arrivals"}
            href="/products?orderby=date"
            badge="NEW ARRIVAL"
            products={newArrivals}
          />
        )
      ) : (
        <BookRowSkeleton title={curated.newArrivalsTitle || "New Arrivals"} />
      )}

      {/* 4 — 4 Categorical Rows: The Bible Speaks Today, Christian Living, Ministry, Theology */}
      <CategoryBookRows rows={categoryRows} />

      {/* 5 — Children Books */}
      {storeReady ? (
        bestsellers.length > 0 && (
          <BookRow
            title={curated.bestsellersTitle || "Children Books"}
            href="/categories/children"
            badge="CHILDREN BOOKS"
            products={bestsellers}
          />
        )
      ) : (
        <BookRowSkeleton title={curated.bestsellersTitle || "Children Books"} />
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

      {/* 7 — Curated Collections */}
      <CollectionsGrid />

      {/* 8 — Social proof */}
      <Testimonials reviews={curated.reviews} />
    </>
  );
}
