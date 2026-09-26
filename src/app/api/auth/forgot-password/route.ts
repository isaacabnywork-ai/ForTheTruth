import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/config/env";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = forgotSchema.parse(json);
    const env = getServerEnv();

    // Call WordPress Lost Password REST endpoint
    const res = await fetch(`${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/bdpwr/v1/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true, message: "Reset email sent if account exists." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
