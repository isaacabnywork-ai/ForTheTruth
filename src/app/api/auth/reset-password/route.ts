import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/config/env";

const resetSchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { token, email, password } = resetSchema.parse(json);
    const env = getServerEnv();

    const res = await fetch(`${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/bdpwr/v1/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "Failed to reset password. Link may be expired." },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, message: "Password reset successful." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid password input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
