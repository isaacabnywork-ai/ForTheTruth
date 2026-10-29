import { getSiteMenusConfig } from "@/services/menus";
import { MenusStudioClient } from "@/components/admin/MenusStudioClient";

export const revalidate = 0;

export default async function AdminMenusPage() {
  const config = getSiteMenusConfig();
  return <MenusStudioClient initialConfig={config} />;
}
