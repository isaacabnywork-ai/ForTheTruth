import { GiftCard } from "@/types/giftCard";
import { recordGiftCardEmail } from "./giftCards";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.forthetruth.in";
const SENDER_NAME = "For The Truth Christian Bookstore";
const SENDER_EMAIL = "contact@forthetruth.in";

/**
 * Builds the recipient gift card delivery HTML email.
 */
export function buildRecipientEmailHtml(giftCard: GiftCard, fullCode: string): string {
  const expiryFormatted = giftCard.expiryDate
    ? new Date(giftCard.expiryDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No expiry date";

  const artworkUrl = giftCard.designImage.startsWith("http")
    ? giftCard.designImage
    : `${SITE_URL}${giftCard.designImage}`;

  const messageBox = giftCard.message
    ? `
      <div style="background-color: #f8fafc; border-left: 4px solid #11426B; padding: 16px 20px; margin: 24px 0; border-radius: 4px; font-style: italic; color: #334155;">
        "${giftCard.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}"
        <div style="margin-top: 8px; font-style: normal; font-weight: 600; color: #11426B; font-size: 13px;">
          — ${giftCard.senderName}
        </div>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your For The Truth Gift Card</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #11426B; padding: 32px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">FOR THE TRUTH</h1>
              <p style="color: #C89B3C; margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Christian Bookstore</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="color: #11426B; margin: 0 0 16px; font-size: 22px; font-weight: 700; text-align: center;">
                A Gift for Your Faith Journey 🎁
              </h2>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px; color: #334155;">
                Dear <strong>${giftCard.recipientName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px; color: #334155;">
                <strong>${giftCard.senderName}</strong> (<a href="mailto:${giftCard.senderEmail}" style="color: #11426B; text-decoration: underline;">${giftCard.senderEmail}</a>) has gifted you a <strong>₹${giftCard.initialAmount.toLocaleString("en-IN")}</strong> digital gift card to spend on Christian books, Bibles, and ministry resources.
              </p>

              <!-- Gift Card Artwork Preview -->
              <div style="text-align: center; margin: 28px 0;">
                <img src="${artworkUrl}" alt="${giftCard.designTitle}" style="max-width: 100%; width: 440px; height: auto; border-radius: 14px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); display: inline-block;" />
              </div>

              ${messageBox}

              <!-- Code Box -->
              <div style="background-color: #FBF9F5; border: 2px dashed #C89B3C; border-radius: 12px; padding: 24px 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748B; font-weight: 600; margin-bottom: 8px;">
                  Your Gift Card Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 700; color: #11426B; letter-spacing: 3px; user-select: all; word-break: break-all;">
                  ${fullCode}
                </div>
                <div style="margin-top: 10px; font-size: 15px; font-weight: 600; color: #0F5132;">
                  Value: ₹${giftCard.initialAmount.toLocaleString("en-IN")}
                </div>
                <div style="margin-top: 4px; font-size: 12px; color: #64748B;">
                  Expiry: ${expiryFormatted}
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${SITE_URL}/shop" style="background-color: #11426B; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(17, 66, 107, 0.25);">
                  Shop Christian Books Now &rarr;
                </a>
              </div>

              <!-- How to Redeem -->
              <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <h3 style="color: #11426B; font-size: 15px; margin: 0 0 12px; font-weight: 600;">How to Redeem Your Gift Card:</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #475569;">
                  <li>Visit our online bookstore at <a href="${SITE_URL}/shop" style="color: #11426B; font-weight: 500;">forthetruth.in/shop</a></li>
                  <li>Add your favorite books, commentaries, or Bibles to your cart.</li>
                  <li>Head over to the Checkout page.</li>
                  <li>Enter your code <strong>${fullCode}</strong> in the "Have a Gift Card?" section and click Apply.</li>
                  <li>Any remaining balance stays on your card for your next purchase!</li>
                </ol>
              </div>

              <div style="margin-top: 24px; text-align: center; font-size: 13px; color: #64748B;">
                You can check your balance anytime at 
                <a href="${SITE_URL}/gift-cards/check-balance" style="color: #11426B; text-decoration: underline;">forthetruth.in/gift-cards/check-balance</a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 8px;">For The Truth Christian Bookstore &bull; Vrindavan Colony, Lucknow, UP</p>
              <p style="margin: 0;">Questions? Reply to this email or write to <a href="mailto:${SENDER_EMAIL}" style="color: #11426B;">${SENDER_EMAIL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds the purchaser confirmation HTML email.
 */
export function buildPurchaserEmailHtml(giftCard: GiftCard): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gift Card has been delivered</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
          <tr>
            <td style="background-color: #11426B; padding: 28px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">FOR THE TRUTH</h1>
              <p style="color: #C89B3C; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Christian Bookstore</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #11426B; margin: 0 0 12px; font-size: 20px; font-weight: 700;">
                Your Gift Card has been delivered! 🎉
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Hi <strong>${giftCard.senderName}</strong>, thank you for sharing the blessing of Christian reading! We've delivered your digital gift card directly to your recipient.
              </p>

              <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
                <table width="100%" style="font-size: 14px; line-height: 2;">
                  <tr>
                    <td style="color: #64748B;">Recipient:</td>
                    <td style="font-weight: 600; color: #1E293B; text-align: right;">${giftCard.recipientName} (${giftCard.recipientEmail})</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Amount:</td>
                    <td style="font-weight: 700; color: #0F5132; text-align: right;">₹${giftCard.initialAmount.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Card Design:</td>
                    <td style="font-weight: 600; color: #1E293B; text-align: right;">${giftCard.designTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Gift Card Code:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #11426B; text-align: right;">${giftCard.code.slice(0, 4)}••••-••••-${giftCard.code.slice(-4)}</td>
                  </tr>
                  ${giftCard.orderId ? `
                  <tr>
                    <td style="color: #64748B;">Order Reference:</td>
                    <td style="font-weight: 600; color: #1E293B; text-align: right;">#${giftCard.orderId}</td>
                  </tr>` : ""}
                </table>
              </div>

              <p style="font-size: 14px; color: #64748B; margin: 0 0 24px;">
                The recipient has been sent their unique code along with instructions on how to redeem it.
              </p>

              <div style="text-align: center;">
                <a href="${SITE_URL}/account/gift-cards" style="background-color: #11426B; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                  View My Gift Cards &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px; text-align: center; font-size: 12px; color: #64748B;">
              For The Truth Christian Bookstore &bull; <a href="mailto:${SENDER_EMAIL}" style="color: #11426B;">${SENDER_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends or simulates delivery of the gift card email to the recipient.
 */
export async function sendGiftCardDeliveryEmail(params: {
  giftCard: GiftCard;
  fullCode: string;
}): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const { giftCard, fullCode } = params;
  const subject = `${giftCard.senderName} sent you a For The Truth Gift Card! 🎁`;
  const htmlContent = buildRecipientEmailHtml(giftCard, fullCode);

  try {
    if (process.env.BREVO_API_KEY) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email: giftCard.recipientEmail, name: giftCard.recipientName }],
          subject,
          htmlContent,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Brevo API Error (${res.status}): ${errorText}`);
      }

      await recordGiftCardEmail(giftCard.id, {
        sentAt: new Date().toISOString(),
        recipientEmail: giftCard.recipientEmail,
        status: "sent",
      });

      return { success: true, simulated: false };
    } else if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.EMAIL_FROM || `${SENDER_NAME} <onboarding@resend.dev>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [giftCard.recipientEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Resend API Error (${res.status}): ${errorText}`);
      }

      await recordGiftCardEmail(giftCard.id, {
        sentAt: new Date().toISOString(),
        recipientEmail: giftCard.recipientEmail,
        status: "sent",
      });

      return { success: true, simulated: false };
    } else {
      console.log("-----------------------------------------------------------------");
      console.log(`[SIMULATED EMAIL] To: ${giftCard.recipientEmail} (${giftCard.recipientName})`);
      console.log(`[SIMULATED EMAIL] Subject: ${subject}`);
      console.log(`[SIMULATED EMAIL] Gift Card Code: ${fullCode} (Amount: ₹${giftCard.initialAmount})`);
      console.log("-----------------------------------------------------------------");

      await recordGiftCardEmail(giftCard.id, {
        sentAt: new Date().toISOString(),
        recipientEmail: giftCard.recipientEmail,
        status: "sent",
      });

      return { success: true, simulated: true };
    }
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`[GiftCardEmail Error] Failed to send email to ${giftCard.recipientEmail}:`, errorMsg);

    await recordGiftCardEmail(giftCard.id, {
      sentAt: new Date().toISOString(),
      recipientEmail: giftCard.recipientEmail,
      status: "failed",
      error: errorMsg,
    });

    return { success: false, error: errorMsg };
  }
}

/**
 * Sends or simulates delivery of the gift card confirmation email to the purchaser.
 */
export async function sendPurchaserConfirmationEmail(params: {
  giftCard: GiftCard;
}): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const { giftCard } = params;
  const subject = `Your For The Truth Gift Card has been delivered! 🎉`;
  const htmlContent = buildPurchaserEmailHtml(giftCard);

  try {
    if (process.env.BREVO_API_KEY) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email: giftCard.senderEmail, name: giftCard.senderName }],
          subject,
          htmlContent,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Brevo API Error (${res.status}): ${errorText}`);
      }

      return { success: true, simulated: false };
    } else if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.EMAIL_FROM || `${SENDER_NAME} <onboarding@resend.dev>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [giftCard.senderEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Resend API Error (${res.status}): ${errorText}`);
      }

      return { success: true, simulated: false };
    } else {
      console.log("-----------------------------------------------------------------");
      console.log(`[SIMULATED EMAIL] To Purchaser: ${giftCard.senderEmail} (${giftCard.senderName})`);
      console.log(`[SIMULATED EMAIL] Subject: ${subject}`);
      console.log("-----------------------------------------------------------------");

      return { success: true, simulated: true };
    }
  } catch (err: any) {
    console.error(`[GiftCardEmail Error] Failed to send confirmation to ${giftCard.senderEmail}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}
