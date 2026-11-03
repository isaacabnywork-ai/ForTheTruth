import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const selectedBookItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  author: z.string().nullable().optional(),
  quantity: z.number().min(1).default(1),
  price: z.union([z.string(), z.number()]).optional(),
});

const bookstallRegistrationSchema = z.object({
  churchName: z.string().min(2, "Church or Ministry name is required").max(200),
  cityState: z.string().min(2, "City and State is required").max(150),
  pastorOrContactName: z.string().min(2, "Contact Person / Pastor name is required").max(120),
  role: z.string().min(1, "Role is required").max(80),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone/WhatsApp number").max(25),
  eventType: z.string().min(1, "Event type is required"),
  customEventType: z.string().optional(),
  bookCategories: z.array(z.string()).default([]),
  bookVolumeDescription: z.string().min(1, "Please describe the approximate number of books needed"),
  selectedBooks: z.array(selectedBookItemSchema).optional().default([]),
  additionalNotes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = bookstallRegistrationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    console.info("🏛️ [CHURCH BOOKSTALL REGISTRATION]", {
      ...data,
      submittedAt: new Date().toISOString(),
    });

    // Send email notification to For The Truth team via Brevo if API key is present
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const emailContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #11426B; margin: 0; font-size: 24px;">🏛️ New Church Bookstall Registration</h2>
              <p style="color: #6B7280; font-size: 14px; margin-top: 4px;">For The Truth Consignment Partnership Program</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; width: 40%; color: #1F2937;">Church / Ministry:</td>
                <td style="padding: 10px 0;">${data.churchName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Location (City, State):</td>
                <td style="padding: 10px 0;">${data.cityState}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Contact Person:</td>
                <td style="padding: 10px 0;">${data.pastorOrContactName} (${data.role})</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #C89B3C;">${data.email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Phone / WhatsApp:</td>
                <td style="padding: 10px 0;"><a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="color: #10B981; font-weight: bold;">${data.phone}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Event / Gathering:</td>
                <td style="padding: 10px 0;">${data.eventType}${data.customEventType ? ` — <em>${data.customEventType}</em>` : ""}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Desired Book Volume:</td>
                <td style="padding: 10px 0;">${data.bookVolumeDescription}</td>
              </tr>
              ${data.bookCategories && data.bookCategories.length > 0 ? `
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937;">Selected Categories:</td>
                <td style="padding: 10px 0;">${data.bookCategories.join(", ")}</td>
              </tr>
              ` : ''}
              ${data.selectedBooks && data.selectedBooks.length > 0 ? `
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937; vertical-align: top;">Specific Books Requested (${data.selectedBooks.length}):</td>
                <td style="padding: 10px 0;">
                  <ul style="margin: 0; padding-left: 18px; color: #374151;">
                    ${data.selectedBooks.map((b) => `<li><strong>${b.quantity}x</strong> ${b.name}${b.author ? ` <span style="color:#6B7280;">by ${b.author}</span>` : ""}</li>`).join("")}
                  </ul>
                </td>
              </tr>
              ` : ''}
              ${data.additionalNotes ? `
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #1F2937; vertical-align: top;">Additional Notes:</td>
                <td style="padding: 10px 0; line-height: 1.5;">${data.additionalNotes}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px; padding: 14px; background: #F9FAFB; border-radius: 8px; text-align: center; font-size: 12px; color: #6B7280;">
              Submitted on forthetruth.in/church-bookstall · Please reply or message via WhatsApp within 24–48 hours.
            </div>
          </div>
        `;

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: "For The Truth Bookstore",
              email: "contact@forthetruth.in",
            },
            to: [
              { email: "contact@forthetruth.in", name: "For The Truth Ministry Team" },
              { email: data.email, name: data.pastorOrContactName },
            ],
            replyTo: {
              email: data.email,
              name: data.pastorOrContactName,
            },
            subject: `🏛️ Church Bookstall Registration — ${data.churchName} (${data.eventType})`,
            htmlContent: emailContent,
          }),
        });
      } catch (mailErr) {
        console.warn("Failed to dispatch Brevo notification for church bookstall:", mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Church bookstall registration received successfully. Our team will contact you shortly.",
    });
  } catch (error) {
    console.error("Church bookstall API error:", error);
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  }
}
