import { getProducts } from "@/services/woocommerce";
import { getCuratedShelfConfig } from "@/services/curation";
import { ShelfCuratorClient } from "@/components/admin/ShelfCuratorClient";

export const revalidate = 30;

export default async function AdminCuratorPage() {
  const [products, config] = await Promise.all([
    getProducts({ perPage: 100, revalidate: 60 }),
    Promise.resolve(getCuratedShelfConfig()),
  ]);

  return <ShelfCuratorClient initialProducts={products} initialConfig={config} />;
}
