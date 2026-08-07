import { NextResponse } from "next/server";
import { z } from "zod";
import path from "path";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  audience: z.enum(["reader", "church"]).default("reader"),
});

// Path for the local fallback log (project root)
const LOG_FILE = path.join(
  process.cwd(),
  "newsletter_subscribers.txt"
);

// ---------------------------------------------------------------------------
// POST /api/newsletter
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ---- Validate ----
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Invalid email address.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, audience } = parsed.data;

    // ---- Route: Brevo or local fallback ----
    if (process.env.BREVO_API_KEY) {
      await subscribeWithBrevo(email, audience);
    } else {
      await logToFile(email, audience);
    }

    return NextResponse.json({
      success: true,
      message: "You're on the list!",
    });
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Brevo (Sendinblue) integration
// ---------------------------------------------------------------------------
async function subscribeWithBrevo(
  email: string,
  audience: "reader" | "church"
) {
  const listId = audience === "church" ? 2 : 1;

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      attributes: { SOURCE: "christiansbook.in" },
      updateEnabled: true, // update existing contacts instead of erroring
    }),
  });

  // 201 = created, 204 = already subscribed — both are success
  if (res.status === 201 || res.status === 204) {
    console.log(`[Newsletter] Brevo subscribed: ${email} (list ${listId})`);
    return;
  }

  // Any other non-ok status is a real error
  const errText = await res.text().catch(() => "");
  throw new Error(`Brevo API error ${res.status}: ${errText}`);
}

// ---------------------------------------------------------------------------
// Local file fallback — writes to newsletter_subscribers.txt at project root
// ---------------------------------------------------------------------------
async function logToFile(email: string, audience: string) {
  // Dynamic import keeps Node.js fs out of any potential edge runtime
  const { appendFileSync, existsSync, writeFileSync } = await import("fs");

  const timestamp = new Date().toISOString();
  const line = `${timestamp} | ${email} | ${audience}\n`;

  if (!existsSync(LOG_FILE)) {
    writeFileSync(
      LOG_FILE,
      "# Newsletter Subscribers — import these to Brevo when you add your API key\n" +
        "# Format: TIMESTAMP | EMAIL | AUDIENCE\n\n",
      "utf-8"
    );
  }

  appendFileSync(LOG_FILE, line, "utf-8");
  console.log(`[Newsletter] Saved locally (no Brevo key): ${email} (${audience})`);
}
