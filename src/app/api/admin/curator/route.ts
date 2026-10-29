import { NextResponse } from "next/server";
import {
  getCuratedShelfConfig,
  fetchCuratedShelfConfigFromCloud,
  saveCuratedShelfConfig,
  type CuratedShelfConfig,
} from "@/services/curation";
import { requireAdmin } from "@/lib/adminGuard";

export const revalidate = 0;

export async function GET() {
  const config = await fetchCuratedShelfConfigFromCloud();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Partial<CuratedShelfConfig>;
    const current = getCuratedShelfConfig();

    const cleanNumArray = (arr: unknown, fallback: number[]) =>
      Array.isArray(arr)
        ? arr.map(Number).filter((n) => !isNaN(n) && n > 0)
        : fallback;

    const nextConfig: CuratedShelfConfig = {
      heroIds: cleanNumArray(body.heroIds, current.heroIds),
      heroBadge: body.heroBadge !== undefined ? body.heroBadge : current.heroBadge,
      heroTitle: body.heroTitle !== undefined ? body.heroTitle : current.heroTitle,
      heroSubtitle: body.heroSubtitle !== undefined ? body.heroSubtitle : current.heroSubtitle,

      spineIds: cleanNumArray(body.spineIds, current.spineIds),
      spineBadge: body.spineBadge !== undefined ? body.spineBadge : current.spineBadge,
      spineTitle: body.spineTitle !== undefined ? body.spineTitle : current.spineTitle,
      spineSubtitle: body.spineSubtitle !== undefined ? body.spineSubtitle : current.spineSubtitle,

      featuredPickId:
        typeof body.featuredPickId === "number"
          ? body.featuredPickId
          : body.featuredPickId === null
          ? null
          : current.featuredPickId,
      featuredBadge:
        body.featuredBadge !== undefined ? body.featuredBadge : current.featuredBadge,
      featuredTitle:
        body.featuredTitle !== undefined ? body.featuredTitle : current.featuredTitle,
      featuredSubtitle:
        body.featuredSubtitle !== undefined ? body.featuredSubtitle : current.featuredSubtitle,

      newArrivalsIds: cleanNumArray(body.newArrivalsIds, current.newArrivalsIds),
      newArrivalsTitle:
        body.newArrivalsTitle !== undefined ? body.newArrivalsTitle : current.newArrivalsTitle,
      bestsellersIds: cleanNumArray(body.bestsellersIds, current.bestsellersIds),
      bestsellersTitle:
        body.bestsellersTitle !== undefined ? body.bestsellersTitle : current.bestsellersTitle,
      bestsellersMode:
        body.bestsellersMode === "manual" || body.bestsellersMode === "category"
          ? body.bestsellersMode
          : current.bestsellersMode ?? "category",

      bibleSpeaksTodayIds: cleanNumArray(
        body.bibleSpeaksTodayIds,
        current.bibleSpeaksTodayIds
      ),
      bibleSpeaksTodayTitle:
        body.bibleSpeaksTodayTitle !== undefined
          ? body.bibleSpeaksTodayTitle
          : current.bibleSpeaksTodayTitle,

      christianLivingIds: cleanNumArray(
        body.christianLivingIds,
        current.christianLivingIds
      ),
      christianLivingTitle:
        body.christianLivingTitle !== undefined
          ? body.christianLivingTitle
          : current.christianLivingTitle,
      christianLivingMode:
        body.christianLivingMode === "manual" || body.christianLivingMode === "category"
          ? body.christianLivingMode
          : current.christianLivingMode ?? "category",

      ministryIds: cleanNumArray(body.ministryIds, current.ministryIds),
      ministryTitle:
        body.ministryTitle !== undefined ? body.ministryTitle : current.ministryTitle,
      ministryMode:
        body.ministryMode === "manual" || body.ministryMode === "category"
          ? body.ministryMode
          : current.ministryMode ?? "category",

      theologyIds: cleanNumArray(body.theologyIds, current.theologyIds),
      theologyTitle:
        body.theologyTitle !== undefined ? body.theologyTitle : current.theologyTitle,
      theologyMode:
        body.theologyMode === "manual" || body.theologyMode === "category"
          ? body.theologyMode
          : current.theologyMode ?? "category",

      reviews: Array.isArray(body.reviews) ? body.reviews : current.reviews,
    };

    await saveCuratedShelfConfig(nextConfig);

    return NextResponse.json({ success: true, config: nextConfig });
  } catch (err: unknown) {
    console.error("Error saving curated shelf config:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update shelf overrides" },
      { status: 500 }
    );
  }
}
