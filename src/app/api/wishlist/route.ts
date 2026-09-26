import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export const revalidate = 0;

/** Resolve the path to the user's wishlist JSON file. */
function wishlistFilePath(userId: number): string {
  return path.join(
    process.cwd(),
    "data",
    "wishlists",
    `${userId}.json`
  );
}

/** GET /api/wishlist — returns the logged-in user's saved wishlist IDs */
export async function GET() {
  const user = await getSessionUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const filePath = wishlistFilePath(user.id);
    const raw = await fs.readFile(filePath, "utf-8").catch(() => null);
    if (!raw) {
      return NextResponse.json({ productIds: [] });
    }
    const data = JSON.parse(raw) as { productIds: number[] };
    return NextResponse.json({ productIds: data.productIds ?? [] });
  } catch {
    return NextResponse.json({ productIds: [] });
  }
}

const PostSchema = z.object({
  productIds: z.array(z.number()),
});

/** POST /api/wishlist — saves wishlist IDs for the logged-in user */
export async function POST(request: Request) {
  const user = await getSessionUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const filePath = wishlistFilePath(user.id);
    // Ensure directory exists (e.g. first write)
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify({ productIds: parsed.data.productIds }, null, 2),
      "utf-8"
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save wishlist" }, { status: 500 });
  }
}
