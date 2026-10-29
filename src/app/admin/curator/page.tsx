import { getProducts } from "@/services/woocommerce";
import { fetchCuratedShelfConfigFromCloud } from "@/services/curation";
import { ShelfCuratorClient } from "@/components/admin/ShelfCuratorClient";

export const revalidate = 0;

export default async function AdminCuratorPage() {
  const [products, config] = await Promise.all([
    getProducts({ perPage: 100, revalidate: 60 }),
    fetchCuratedShelfConfigFromCloud(),
  ]);

  return <ShelfCuratorClient initialProducts={products} initialConfig={config} />;
}
