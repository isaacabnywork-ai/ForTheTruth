import { NextResponse } from "next/server";
import {
  getSiteMenusConfig,
  fetchSiteMenusConfigFromCloud,
  saveSiteMenusConfig,
  type SiteMenusConfig,
} from "@/services/menus";
import { requireAdmin } from "@/lib/adminGuard";

export const revalidate = 0;

export async function GET() {
  const config = await fetchSiteMenusConfigFromCloud();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Partial<SiteMenusConfig>;
    const current = getSiteMenusConfig();

    const nextConfig: SiteMenusConfig = {
      announcement: body.announcement ?? current.announcement,
      headerNav: Array.isArray(body.headerNav) ? body.headerNav : current.headerNav,
      footerShop: Array.isArray(body.footerShop) ? body.footerShop : current.footerShop,
      footerCompany: Array.isArray(body.footerCompany) ? body.footerCompany : current.footerCompany,
      footerQuick: Array.isArray(body.footerQuick) ? body.footerQuick : current.footerQuick,
      contactPhone: body.contactPhone ?? current.contactPhone,
      contactEmail: body.contactEmail ?? current.contactEmail,
      copyrightText: body.copyrightText ?? current.copyrightText,
    };

    await saveSiteMenusConfig(nextConfig);

    return NextResponse.json({ success: true, config: nextConfig });
  } catch (err: unknown) {
    console.error("Error saving site menus:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update menus" },
      { status: 500 }
    );
  }
}
