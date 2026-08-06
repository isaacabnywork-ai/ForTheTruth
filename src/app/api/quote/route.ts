import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  churchName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  congregationSize: z.string().max(120).optional(),
  needs: z.string().min(5).max(3000),
});

/**
 * Church quote requests.
 * TODO: forward to email (Resend/SendGrid) or your CRM.
 * For now requests are logged server-side so nothing is lost.
 */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  console.info("[QUOTE REQUEST]", {
    ...parsed.data,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
