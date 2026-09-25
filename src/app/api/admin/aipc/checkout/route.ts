import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lineItems } = body;

    const dataPath = path.join(process.cwd(), "src/data/aipc_books.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const books = JSON.parse(fileContent);

    // Update stock in the local JSON file
    for (const item of lineItems) {
      const index = item.product_id - 100000; // Reverse mapped ID
      if (books[index] && typeof books[index]["AIPC QTY"] === "number") {
        books[index]["AIPC QTY"] = Math.max(0, books[index]["AIPC QTY"] - item.quantity);
        books[index]["AIPC Sold"] = (books[index]["AIPC Sold"] || 0) + item.quantity;
      }
    }

    fs.writeFileSync(dataPath, JSON.stringify(books, null, 2), "utf8");

    // Save order data to aipc_orders.json
    const ordersPath = path.join(process.cwd(), "src/data/aipc_orders.json");
    let orders = [];
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
    }

    const orderId = Math.floor(100000 + Math.random() * 900000);
    orders.push({
      id: orderId,
      date: new Date().toISOString(),
      ...body
    });
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), "utf8");
    
    return NextResponse.json({ success: true, order: { id: orderId } });
  } catch (error: unknown) {
    console.error("AIPC checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process AIPC offline order and update local stock." },
      { status: 500 }
    );
  }
}
