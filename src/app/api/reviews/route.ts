import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createReview, WCApiError } from "@/services/woocommerce";

const schema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(20, "Review must be at least 20 characters").max(3000),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser().catch(() => null);
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to write a review" },
      { status: 401 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const review = await createReview({
      product_id: parsed.data.productId,
      rating: parsed.data.rating,
      review: parsed.data.review,
      reviewer: `${user.firstName} ${user.lastName.charAt(0)}.`.trim(),
      reviewer_email: user.email,
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    if (err instanceof WCApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
