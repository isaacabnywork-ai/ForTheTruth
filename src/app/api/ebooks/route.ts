import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  getCustomerByEmail,
  createFreeOrder,
  getCustomerDownloads,
  getOrdersByCustomer,
} from "@/services/woocommerce";

// ─── GET — check if user already has this ebook & get download link ───────────
export async function GET(req: NextRequest) {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const productId = req.nextUrl.searchParams.get("productId");

  try {
    let customerId = user.id;
    if (!customerId) {
      const customer = await getCustomerByEmail(user.email).catch(() => null);
      customerId = customer?.id ?? 0;
    }
    if (!customerId) return NextResponse.json({ downloads: [], alreadyOwned: false });

    const downloads = await getCustomerDownloads(customerId);

    if (productId) {
      const match = downloads.filter((d) => d.product_id === parseInt(productId, 10));
      return NextResponse.json({
        alreadyOwned: match.length > 0,
        downloads: match,
      });
    }

    return NextResponse.json({ downloads, alreadyOwned: false });
  } catch (err) {
    console.error("[ebooks GET]", err);
    return NextResponse.json({ downloads: [], alreadyOwned: false });
  }
}

// ─── POST — claim a free ebook (creates a completed WC order) ─────────────────
export async function POST(req: NextRequest) {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) return NextResponse.json({ error: "Please log in to download this e-book." }, { status: 401 });

  const { productId, productName } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  try {
    let customerId = user.id;
    if (!customerId) {
      const customer = await getCustomerByEmail(user.email).catch(() => null);
      customerId = customer?.id ?? 0;
    }
    if (!customerId) {
      return NextResponse.json({ error: "Customer record not found. Please try again." }, { status: 404 });
    }

    // Check if already owned to avoid duplicate orders
    const existingDownloads = await getCustomerDownloads(customerId).catch(() => []);
    const alreadyOwned = existingDownloads.some((d) => d.product_id === productId);
    if (alreadyOwned) {
      const links = existingDownloads.filter((d) => d.product_id === productId);
      return NextResponse.json({ success: true, alreadyOwned: true, downloads: links });
    }

    // Create a free completed WC order → WooCommerce generates the download link
    const billing: Record<string, string> = {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "IN",
    };

    const order = await createFreeOrder({
      productId,
      productName: productName ?? "E-Book",
      customerId: customerId,
      billing,
    });

    // Fetch fresh download links after order creation
    const downloads = await getCustomerDownloads(customerId).catch(() => []);
    const newLinks = downloads.filter((d) => d.product_id === productId);

    return NextResponse.json({
      success: true,
      alreadyOwned: false,
      orderId: order.id,
      downloads: newLinks,
    });
  } catch (err) {
    console.error("[ebooks POST]", err);
    const msg = err instanceof Error ? err.message : "Failed to claim e-book";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
