import fs from "fs";
import path from "path";
import type { MenuItem, SiteMenusConfig } from "@/types/menus";
import { DEFAULT_MENUS_CONFIG } from "@/types/menus";

export type { MenuItem, SiteMenusConfig };
export { DEFAULT_MENUS_CONFIG };

function getMenusFilePath() {
  return path.join(process.cwd(), "src", "config", "site_menus.json");
}

export function getSiteMenusConfig(): SiteMenusConfig {
  try {
    const filePath = getMenusFilePath();
    if (!fs.existsSync(filePath)) {
      return DEFAULT_MENUS_CONFIG;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return {
      announcement: data.announcement ?? DEFAULT_MENUS_CONFIG.announcement,
      headerNav: Array.isArray(data.headerNav) && data.headerNav.length > 0 ? data.headerNav : DEFAULT_MENUS_CONFIG.headerNav,
      footerShop: Array.isArray(data.footerShop) && data.footerShop.length > 0 ? data.footerShop : DEFAULT_MENUS_CONFIG.footerShop,
      footerCompany: Array.isArray(data.footerCompany) && data.footerCompany.length > 0 ? data.footerCompany : DEFAULT_MENUS_CONFIG.footerCompany,
      footerQuick: Array.isArray(data.footerQuick) && data.footerQuick.length > 0 ? data.footerQuick : DEFAULT_MENUS_CONFIG.footerQuick,
      contactPhone: data.contactPhone ?? DEFAULT_MENUS_CONFIG.contactPhone,
      contactEmail: data.contactEmail ?? DEFAULT_MENUS_CONFIG.contactEmail,
      copyrightText: data.copyrightText ?? DEFAULT_MENUS_CONFIG.copyrightText,
    };
  } catch (err) {
    console.error("Failed to read site_menus.json, using fallback", err);
    return DEFAULT_MENUS_CONFIG;
  }
}

export function saveSiteMenusConfig(config: SiteMenusConfig): void {
  try {
    const filePath = getMenusFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save site_menus.json", err);
    throw new Error("Unable to persist site menus configuration.");
  }
}
