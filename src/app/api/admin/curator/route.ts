import { NextResponse } from "next/server";
import { getCuratedShelfConfig, saveCuratedShelfConfig, type CuratedShelfConfig } from "@/services/curation";
import { requireAdmin } from "@/lib/adminGuard";

export const revalidate = 0;

export async function GET() {
  const config = getCuratedShelfConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Partial<CuratedShelfConfig>;
    const current = getCuratedShelfConfig();

    const nextConfig: CuratedShelfConfig = {
      heroIds: Array.isArray(body.heroIds) ? body.heroIds.map(Number).filter((n) => !isNaN(n)) : current.heroIds,
      heroBadge: body.heroBadge !== undefined ? body.heroBadge : current.heroBadge,
      heroTitle: body.heroTitle !== undefined ? body.heroTitle : current.heroTitle,
      heroSubtitle: body.heroSubtitle !== undefined ? body.heroSubtitle : current.heroSubtitle,

      spineIds: Array.isArray(body.spineIds) ? body.spineIds.map(Number).filter((n) => !isNaN(n)) : current.spineIds,
      spineBadge: body.spineBadge !== undefined ? body.spineBadge : current.spineBadge,
      spineTitle: body.spineTitle !== undefined ? body.spineTitle : current.spineTitle,
      spineSubtitle: body.spineSubtitle !== undefined ? body.spineSubtitle : current.spineSubtitle,

      featuredPickId: typeof body.featuredPickId === "number" ? body.featuredPickId : (body.featuredPickId === null ? null : current.featuredPickId),
      featuredBadge: body.featuredBadge !== undefined ? body.featuredBadge : current.featuredBadge,
      featuredTitle: body.featuredTitle !== undefined ? body.featuredTitle : current.featuredTitle,
      featuredSubtitle: body.featuredSubtitle !== undefined ? body.featuredSubtitle : current.featuredSubtitle,

      newArrivalsIds: Array.isArray(body.newArrivalsIds) ? body.newArrivalsIds.map(Number).filter((n) => !isNaN(n)) : current.newArrivalsIds,
      newArrivalsTitle: body.newArrivalsTitle !== undefined ? body.newArrivalsTitle : current.newArrivalsTitle,
      bestsellersIds: Array.isArray(body.bestsellersIds) ? body.bestsellersIds.map(Number).filter((n) => !isNaN(n)) : current.bestsellersIds,
      bestsellersTitle: body.bestsellersTitle !== undefined ? body.bestsellersTitle : current.bestsellersTitle,
    };

    saveCuratedShelfConfig(nextConfig);

    return NextResponse.json({ success: true, config: nextConfig });
  } catch (err: any) {
    console.error("Error saving curated shelf config:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update shelf overrides" },
      { status: 500 }
    );
  }
}
