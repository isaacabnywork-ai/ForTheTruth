import { BookRow, BookRowSkeleton } from "@/components/products/BookRow";
import { HeroShelf } from "@/components/home/HeroShelf";
import { TopicGrid } from "@/components/home/TopicGrid";
import {
  CategoryBookRows,
  type CategoryRowItem,
} from "@/components/home/CategoryBookRows";
import { Testimonials } from "@/components/home/Testimonials";
import { SpineSlider } from "@/components/home/SpineSlider";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import { isWooConfigured } from "@/config/env";
import { getCategories, getProducts } from "@/services/woocommerce";
import { fetchCuratedShelfConfigFromCloud } from "@/services/curation";
import categoryRowsFallbackData from "@/data/category_rows_fallback.json";
import type { Product, WCCategory } from "@/types/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sortByIdList(products: Product[], ids: number[]): Product[] {
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function HomePage() {
  let featured: Product[] = [];
  let newArrivals: Product[] = [];
  let bestsellers: Product[] = [];
  let spineProducts: Product[] = [];
  let categories: WCCategory[] = [];
  let coversByCategory: Record<number, Product[]> = {};

  let bibleSpeaksTodayProducts: Product[] = [];
  let christianLivingProducts: Product[] = [];
  let ministryProducts: Product[] = [];
  let theologyProducts: Product[] = [];

  const curated = await fetchCuratedShelfConfigFromCloud();

  // Setup fallback map from local data
  const fallbackMap = new Map<number, Product>();
  (categoryRowsFallbackData as unknown as Product[]).forEach((p) => {
    fallbackMap.set(p.id, p);
  });

  const getFallbackList = (ids: number[]): Product[] =>
    ids.map((id) => fallbackMap.get(id)).filter(Boolean) as Product[];

  if (isWooConfigured()) {
    try {
      // 1. Hero Query
      const heroQuery =
        curated.heroIds.length > 0
          ? getProducts({
              include: curated.heroIds,
              perPage: curated.heroIds.length,
              revalidate: 60,
            }).catch(() => [])
          : getProducts({
              featured: true,
              perPage: 9,
              revalidate: 60,
            }).catch(() => []);

      // 2. New Arrivals (Strictly Book IDs only)
      const newQuery =
        curated.newArrivalsIds.length > 0
          ? getProducts({
              include: curated.newArrivalsIds,
              perPage: curated.newArrivalsIds.length,
              revalidate: 60,
            }).catch(() => [])
          : getProducts({
              perPage: 6,
              orderby: "date" as const,
              order: "desc" as const,
              revalidate: 60,
            }).catch(() => []);

      // 3. Children Books Shelf (Category 114 dynamic rotation OR manual IDs)
      const isChildrenCategoryMode = curated.bestsellersMode !== "manual";
      const childrenQuery = isChildrenCategoryMode
        ? getProducts({ category: 114, perPage: 30, revalidate: 60 }).catch(() => [])
        : curated.bestsellersIds.length > 0
        ? getProducts({
            include: curated.bestsellersIds,
            perPage: curated.bestsellersIds.length,
            revalidate: 60,
          }).catch(() => [])
        : getProducts({ category: 114, perPage: 6, revalidate: 60 }).catch(() => []);

      // 4. Spine Slider
      const spineQuery =
        curated.spineIds.length > 0
          ? getProducts({
              include: curated.spineIds,
              perPage: curated.spineIds.length,
              revalidate: 60,
            }).catch(() => [])
          : getProducts({ category: 114, perPage: 10, revalidate: 60 }).catch(() => []);

      // 5. The Bible Speaks Today (Strictly Book IDs only)
      const bstIds =
        curated.bibleSpeaksTodayIds && curated.bibleSpeaksTodayIds.length > 0
          ? curated.bibleSpeaksTodayIds
          : [36313, 36309, 36306, 36302, 36294, 36285];
      const bstQuery = getProducts({
        include: bstIds,
        perPage: bstIds.length,
        revalidate: 60,
      }).catch(() => []);

      // 6. Christian Living (Category 112 dynamic rotation OR manual IDs)
      const isClCategoryMode = curated.christianLivingMode !== "manual";
      const clIds =
        curated.christianLivingIds && curated.christianLivingIds.length > 0
          ? curated.christianLivingIds
          : [38336, 31266, 46237, 38662, 4793, 53424];
      const clQuery = isClCategoryMode
        ? getProducts({ category: 112, perPage: 30, revalidate: 60 }).catch(() => [])
        : getProducts({
            include: clIds,
            perPage: clIds.length,
            revalidate: 60,
          }).catch(() => []);

      // 7. Ministry (Category 1727 dynamic rotation OR manual IDs)
      const isMinistryCategoryMode = curated.ministryMode !== "manual";
      const ministryIds =
        curated.ministryIds && curated.ministryIds.length > 0
          ? curated.ministryIds
          : [44354, 14694, 22394, 14678, 14669, 4958];
      const ministryQuery = isMinistryCategoryMode
        ? getProducts({ category: 1727, perPage: 30, revalidate: 60 }).catch(() => [])
        : getProducts({
            include: ministryIds,
            perPage: ministryIds.length,
            revalidate: 60,
          }).catch(() => []);

      // 8. Theology (Category 1717 dynamic rotation OR manual IDs)
      const isTheologyCategoryMode = curated.theologyMode !== "manual";
      const theologyIds =
        curated.theologyIds && curated.theologyIds.length > 0
          ? curated.theologyIds
          : [31091, 31117, 31424, 52810, 31100, 31155];
      const theologyQuery = isTheologyCategoryMode
        ? getProducts({ category: 1717, perPage: 30, revalidate: 60 }).catch(() => [])
        : getProducts({
            include: theologyIds,
            perPage: theologyIds.length,
            revalidate: 60,
          }).catch(() => []);

      const [
        fetchedHero,
        fetchedNew,
        fetchedChildren,
        fetchedCategories,
        fetchedSpine,
        fetchedBst,
        fetchedCl,
        fetchedMinistry,
        fetchedTheology,
      ] = await Promise.all([
        heroQuery,
        newQuery,
        childrenQuery,
        getCategories().catch(() => []),
        spineQuery,
        bstQuery,
        clQuery,
        ministryQuery,
        theologyQuery,
      ]);

      // Hero
      if (curated.heroIds.length > 0) {
        featured = sortByIdList(fetchedHero, curated.heroIds);
      } else {
        featured = fetchedHero;
      }

      // New Arrivals (Strictly Book IDs in exact order)
      if (curated.newArrivalsIds.length > 0) {
        newArrivals = sortByIdList(fetchedNew, curated.newArrivalsIds);
      } else {
        newArrivals = fetchedNew.slice(0, 6);
      }

      // Children Books (Dynamic Category shuffle on refresh vs Manual IDs)
      if (isChildrenCategoryMode && fetchedChildren.length > 0) {
        bestsellers = shuffleArray(fetchedChildren).slice(0, 6);
      } else if (curated.bestsellersIds.length > 0) {
        bestsellers = sortByIdList(fetchedChildren, curated.bestsellersIds);
      } else {
        bestsellers = fetchedChildren.slice(0, 6);
      }

      // Spine slider
      if (curated.spineIds.length > 0 && fetchedSpine.length > 0) {
        spineProducts = sortByIdList(fetchedSpine, curated.spineIds);
      } else {
        spineProducts = fetchedSpine.slice(0, 10);
      }

      // 4 Category Rows
      // A. The Bible Speaks Today (Strictly book IDs only)
      bibleSpeaksTodayProducts = sortByIdList(fetchedBst, bstIds);
      if (bibleSpeaksTodayProducts.length === 0) {
        bibleSpeaksTodayProducts = getFallbackList(bstIds);
      }

      // B. Christian Living (Dynamic shuffle vs Manual)
      if (isClCategoryMode && fetchedCl.length > 0) {
        christianLivingProducts = shuffleArray(fetchedCl).slice(0, 6);
      } else if (fetchedCl.length > 0) {
        christianLivingProducts = sortByIdList(fetchedCl, clIds);
      } else {
        christianLivingProducts = getFallbackList(clIds);
      }

      // C. Ministry (Dynamic shuffle vs Manual)
      if (isMinistryCategoryMode && fetchedMinistry.length > 0) {
        ministryProducts = shuffleArray(fetchedMinistry).slice(0, 6);
      } else if (fetchedMinistry.length > 0) {
        ministryProducts = sortByIdList(fetchedMinistry, ministryIds);
      } else {
        ministryProducts = getFallbackList(ministryIds);
      }

      // D. Theology (Dynamic shuffle vs Manual)
      if (isTheologyCategoryMode && fetchedTheology.length > 0) {
        theologyProducts = shuffleArray(fetchedTheology).slice(0, 6);
      } else if (fetchedTheology.length > 0) {
        theologyProducts = sortByIdList(fetchedTheology, theologyIds);
      } else {
        theologyProducts = getFallbackList(theologyIds);
      }

      categories = fetchedCategories;

      // Cover thumbnails for topic grid
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

  // Final fallback check for the 4 rows
  const categoryRows: CategoryRowItem[] = [
    {
      title: curated.bibleSpeaksTodayTitle || "The Bible Speaks Today",
      slug: "bible-speaks-today",
      viewMoreHref: "/categories/bible-commentary",
      badge: "BIBLE SPEAKS TODAY",
      products: bibleSpeaksTodayProducts,
    },
    {
      title: curated.christianLivingTitle || "Christian Living",
      slug: "christian-living",
      viewMoreHref: "/categories/christian-living",
      badge: "CHRISTIAN LIVING",
      products: christianLivingProducts,
    },
    {
      title: curated.ministryTitle || "Ministry",
      slug: "ministry",
      viewMoreHref: "/categories/ministry",
      badge: "MINISTRY",
      products: ministryProducts,
    },
    {
      title: curated.theologyTitle || "Theology",
      slug: "theology",
      viewMoreHref: "/categories/theology",
      badge: "THEOLOGY",
      products: theologyProducts,
    },
  ];

  const storeReady = newArrivals.length > 0 || bestsellers.length > 0;
  const hasAnyBooks =
    featured.length > 0 ||
    newArrivals.length > 0 ||
    bestsellers.length > 0 ||
    spineProducts.length > 0 ||
    categoryRows.some((r) => r.products.length > 0);

  if (!hasAnyBooks) {
    return <StoreMaintenancePage />;
  }

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

      {/* 3 — New Arrivals (Strictly book IDs only) */}
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

      {/* 4 — 4 Categorical Rows: The Bible Speaks Today (by ID), Christian Living (dynamic), Ministry (dynamic), Theology (dynamic) */}
      <CategoryBookRows rows={categoryRows} />

      {/* 5 — Children Books Shelf (dynamic rotation or manual by ID) */}
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

      {/* 7 — Customer Reviews Slider */}
      <Testimonials reviews={curated.reviews} />
    </>
  );
}
