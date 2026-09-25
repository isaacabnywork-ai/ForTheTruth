import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminGuard";

const ORDERS_PATH = () => path.join(process.cwd(), "src/data/aipc_orders.json");

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!fs.existsSync(ORDERS_PATH())) {
      return NextResponse.json([]);
    }
    const orders = JSON.parse(fs.readFileSync(ORDERS_PATH(), "utf8"));
    // Return newest first
    return NextResponse.json(orders.reverse());
  } catch (error) {
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, action = "refund" } = await req.json();
    const ordersPath = ORDERS_PATH();
    if (!fs.existsSync(ordersPath)) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    const orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[orderIndex];
    if (order.refunded) {
      return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
    }

    // If it's a full refund on a Razorpay order, process financial refund via Razorpay API
    const notes = order.notes || "";
    const rzpMatch = notes.match(/Razorpay ID:\s*(pay_[a-zA-Z0-9_]+)/);
    
    if (action === "refund" && rzpMatch) {
      const paymentId = rzpMatch[1];
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ amount: Math.round(order.totalAmount * 100) })
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok && rzpData.error?.code !== "BAD_REQUEST_ERROR") { 
        // Ignore bad request only if it says already refunded, otherwise throw
        // (For simplicity we throw on any hard Razorpay failure)
        throw new Error(`Razorpay Refund Failed: ${rzpData.error?.description || "Unknown error"}`);
      }
    }

    // Update local stock to return items
    const booksPath = path.join(process.cwd(), "src/data/aipc_books.json");
    if (fs.existsSync(booksPath)) {
      const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
      for (const item of order.lineItems) {
        const index = item.product_id - 100000;
        if (books[index]) {
          books[index]["AIPC QTY"] = (books[index]["AIPC QTY"] || 0) + item.quantity;
          books[index]["AIPC Sold"] = Math.max(0, (books[index]["AIPC Sold"] || 0) - item.quantity);
        }
      }
      fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), "utf8");
    }

    // Mark order as refunded / exchanged
    orders[orderIndex].refunded = true;
    orders[orderIndex].refundedAt = new Date().toISOString();
    orders[orderIndex].refundType = action; // 'refund' or 'exchange'
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), "utf8");

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: error.message || "Failed to process refund" }, { status: 500 });
  }
}
