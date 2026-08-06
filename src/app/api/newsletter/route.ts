import { NextResponse } from "next/server";

/**
 * Newsletter subscription endpoint.
 * Right now this is a stub — wire up your email provider (Mailchimp/Brevo)
 * by replacing the body of this route.
 */
export async function POST(request: Request) {
  try {
    const { email, audience } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // ---- Plug in your email provider here ----
    // Example for Brevo (formerly Sendinblue):
    // const BREVO_LIST_ID = audience === "church" ? 2 : 1;
    // await fetch("https://api.brevo.com/v3/contacts", {
    //   method: "POST",
    //   headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, listIds: [BREVO_LIST_ID] }),
    // });
    //
    // Example for Mailchimp:
    // await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
    //   email_address: email,
    //   status: "subscribed",
    //   tags: [audience],
    // });
    // ------------------------------------------

    // Log the subscription for now until a provider is configured
    console.log(`[Newsletter] New subscriber: ${email} (${audience})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
  }
}
