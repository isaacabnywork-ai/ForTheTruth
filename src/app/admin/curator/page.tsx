import { getAllProducts, getCategories, getProducts } from "@/services/woocommerce";
import { fetchCuratedShelfConfigFromCloud } from "@/services/curation";
import { ShelfCuratorClient } from "@/components/admin/ShelfCuratorClient";
import type { Product, WCCategory } from "@/types/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCuratorPage() {
  const config = await fetchCuratedShelfConfigFromCloud();

  const configuredIds = Array.from(
    new Set(
      [
        ...config.heroIds,
        ...config.spineIds,
        ...(config.featuredPickId ? [config.featuredPickId] : []),
        ...config.newArrivalsIds,
        ...config.bestsellersIds,
        ...config.bibleSpeaksTodayIds,
        ...config.christianLivingIds,
        ...config.ministryIds,
        ...config.theologyIds,
        ...(config.extraCategoryShelves ?? []).flatMap((s) => s.bookIds),
      ].filter((id): id is number => typeof id === "number" && id > 0)
    )
  );

  const [allStoreProducts, specificConfigProducts, storeCategories] = await Promise.all([
    getAllProducts({ status: "any", revalidate: 60 }).catch(() => []),
    configuredIds.length > 0
      ? getProducts({
          include: configuredIds,
          perPage: configuredIds.length,
          revalidate: 0,
        }).catch(() => [])
      : Promise.resolve([]),
    getCategories().catch(() => []),
  ]);

  const productMap = new Map<number, Product>();
  allStoreProducts.forEach((p) => productMap.set(p.id, p));
  specificConfigProducts.forEach((p) => productMap.set(p.id, p));

  const categoryMap = new Map<number, WCCategory>();
  storeCategories.forEach((cat) => categoryMap.set(cat.id, cat));
  productMap.forEach((p) => {
    p.categories?.forEach((cat) => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        });
      }
    });
  });
  const mergedCategories = Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <ShelfCuratorClient
      initialProducts={Array.from(productMap.values())}
      initialConfig={config}
      initialCategories={mergedCategories}
    />
  );
}
