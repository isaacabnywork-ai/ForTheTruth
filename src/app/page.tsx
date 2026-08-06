import { Bookshelf, BookshelfSkeleton } from "@/components/products/Bookshelf";
import { HeroShelf } from "@/components/home/HeroShelf";
import { TopicGrid } from "@/components/home/TopicGrid";
import { FeaturedPick } from "@/components/home/FeaturedPick";
import { ChurchBanner } from "@/components/home/ChurchBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { SpineSlider } from "@/components/home/SpineSlider";
import { isWooConfigured } from "@/config/env";
import { getCategories, getProducts } from "@/services/woocommerce";
import { getCuratedShelfConfig } from "@/services/curation";
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
  let customPick: Product | undefined = undefined;
  let categories: WCCategory[] = [];
  let coversByCategory: Record<number, Product[]> = {};
  const curated = getCuratedShelfConfig();

  if (isWooConfigured()) {
    try {
      const heroQuery = curated.heroIds.length > 0 ? { include: curated.heroIds, perPage: curated.heroIds.length } : { featured: true, perPage: 9 };
      const newQuery = curated.newArrivalsIds.length > 0 ? { include: curated.newArrivalsIds, perPage: curated.newArrivalsIds.length } : { perPage: 6, orderby: "date" as const, order: "desc" as const };
      const bestQuery = curated.bestsellersIds.length > 0 ? { include: curated.bestsellersIds, perPage: curated.bestsellersIds.length } : { perPage: 6, orderby: "popularity" as const, order: "desc" as const };
      const spineQuery = curated.spineIds.length > 0 ? { include: curated.spineIds, perPage: curated.spineIds.length } : undefined;
      const pickQuery = curated.featuredPickId ? { include: [curated.featuredPickId], perPage: 1 } : undefined;

      const results = await Promise.all([
        getProducts(heroQuery),
        getProducts(newQuery),
        getProducts(bestQuery),
        getCategories(),
        spineQuery ? getProducts(spineQuery) : Promise.resolve([]),
        pickQuery ? getProducts(pickQuery) : Promise.resolve([]),
      ]);

      featured = results[0];
      newArrivals = results[1];
      bestsellers = results[2];
      categories = results[3];
      const fetchedSpine = results[4];
      const fetchedPick = results[5];

      if (curated.heroIds.length > 0) featured = sortByIdList(featured, curated.heroIds);
      else if (featured.length < 5) {
        featured = await getProducts({ perPage: 9, orderby: "popularity", order: "desc" });
      }

      if (curated.newArrivalsIds.length > 0) newArrivals = sortByIdList(newArrivals, curated.newArrivalsIds);
      if (curated.bestsellersIds.length > 0) bestsellers = sortByIdList(bestsellers, curated.bestsellersIds);
      
      if (curated.spineIds.length > 0 && fetchedSpine.length > 0) {
        spineProducts = sortByIdList(fetchedSpine, curated.spineIds);
      } else {
        spineProducts = featured;
      }

      if (fetchedPick && fetchedPick.length > 0) {
        customPick = fetchedPick[0];
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

  const storeReady = newArrivals.length > 0 || bestsellers.length > 0;
  // Featured pick: override with explicit selection or fall back to automatic pick
  const pick = customPick ?? featured[1] ?? bestsellers[0] ?? featured[0];

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

      {/* 3 — Shelves with custom title & ID support */}
      {storeReady ? (
        <>
          {newArrivals.length > 0 && (
            <Bookshelf
              title={curated.newArrivalsTitle || "New Arrivals"}
              href="/products?orderby=date"
              products={newArrivals}
            />
          )}
          {bestsellers.length > 0 && (
            <Bookshelf
              title={curated.bestsellersTitle || "Bestsellers"}
              href="/products?orderby=popularity"
              products={bestsellers}
            />
          )}
        </>
      ) : (
        <>
          <BookshelfSkeleton title={curated.newArrivalsTitle || "New Arrivals"} />
          <BookshelfSkeleton title={curated.bestsellersTitle || "Bestsellers"} />
        </>
      )}

      {/* 4 — Editor's Choice Featured pick with customizable titles */}
      {pick && (
        <FeaturedPick
          product={pick}
          badge={curated.featuredBadge}
          title={curated.featuredTitle}
          subtitle={curated.featuredSubtitle}
        />
      )}

      {/* 5 — Church / bulk pathway */}
      <ChurchBanner />

      {/* 6 — Explore the shelf (spine slider) with customizable titles & book selection */}
      {spineProducts.length > 0 && (
        <SpineSlider
          products={spineProducts}
          badge={curated.spineBadge}
          title={curated.spineTitle}
          subtitle={curated.spineSubtitle}
        />
      )}

      {/* 7 — Social proof */}
      <Testimonials />
    </>
  );
}
