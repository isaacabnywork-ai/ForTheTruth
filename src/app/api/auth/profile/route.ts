import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { updateCustomer } from "@/services/woocommerce";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await updateCustomer(user.id, {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      billing: parsed.data.phone ? { phone: parsed.data.phone } : undefined,
    } as never);
    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        avatarUrl: updated.avatar_url,
      },
    });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
