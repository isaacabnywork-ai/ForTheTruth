import { getProducts } from "@/services/woocommerce";
import { fetchCuratedShelfConfigFromCloud } from "@/services/curation";
import { ShelfCuratorClient } from "@/components/admin/ShelfCuratorClient";
import type { Product } from "@/types/product";

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
      ].filter((id): id is number => typeof id === "number" && id > 0)
    )
  );

  const [recentProducts, specificConfigProducts] = await Promise.all([
    getProducts({ perPage: 100, revalidate: 0 }).catch(() => []),
    configuredIds.length > 0
      ? getProducts({
          include: configuredIds,
          perPage: configuredIds.length,
          revalidate: 0,
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const productMap = new Map<number, Product>();
  recentProducts.forEach((p) => productMap.set(p.id, p));
  specificConfigProducts.forEach((p) => productMap.set(p.id, p));

  return (
    <ShelfCuratorClient
      initialProducts={Array.from(productMap.values())}
      initialConfig={config}
    />
  );
}
