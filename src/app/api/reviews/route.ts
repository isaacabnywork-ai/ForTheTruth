import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createReview, WCApiError } from "@/services/woocommerce";

const schema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(3, "Review must be at least 3 characters").max(3000),
  reviewer_name: z.string().optional(),
  reviewer_email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser().catch(() => null);
  const parsed = schema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const reviewerName =
    user
      ? `${user.firstName || ""} ${user.lastName ? user.lastName.charAt(0) + "." : ""}`.trim() || user.displayName || "Reader"
      : parsed.data.reviewer_name?.trim() || "Reader";

  const reviewerEmail = user?.email || parsed.data.reviewer_email;

  if (!reviewerEmail) {
    return NextResponse.json(
      { error: "Please sign in or provide your email to submit a review" },
      { status: 401 }
    );
  }

  try {
    const review = await createReview({
      product_id: parsed.data.productId,
      rating: parsed.data.rating,
      review: parsed.data.review,
      reviewer: reviewerName,
      reviewer_email: reviewerEmail,
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    if (err instanceof WCApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
