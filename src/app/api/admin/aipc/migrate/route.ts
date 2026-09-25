import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    // 1. Migrate Books
    const booksPath = path.join(process.cwd(), "src/data/aipc_books.json");
    if (fs.existsSync(booksPath)) {
      const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
      // Ensure they all have an ID
      const booksToInsert = books.map((b: any, index: number) => ({
        id: 100000 + index,
        TITLE: b.TITLE || "",
        "AIPC QTY": typeof b["AIPC QTY"] === "number" ? b["AIPC QTY"] : 0,
        "AIPC Sold": typeof b["AIPC Sold"] === "number" ? b["AIPC Sold"] : 0,
        ISBN: b.ISBN || null,
        PRICE: b.PRICE || 0,
        AUTHOR: b.AUTHOR || "",
      }));
      
      const { error: booksErr } = await supabase.from("aipc_books").upsert(booksToInsert);
      if (booksErr) throw new Error("Books migration failed: " + booksErr.message);
    }

    // 2. Migrate Orders
    const ordersPath = path.join(process.cwd(), "src/data/aipc_orders.json");
    if (fs.existsSync(ordersPath)) {
      const orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
      const ordersToInsert = orders.map((o: any) => ({
        id: o.id,
        date: o.date || new Date().toISOString(),
        lineItems: o.lineItems || [],
        totalAmount: o.totalAmount || 0,
        discountAmount: o.discountAmount || 0,
        customerName: o.customerName || "",
        customerPhone: o.customerPhone || "",
        customerEmail: o.customerEmail || "",
        notes: o.notes || "",
        paymentMethod: o.paymentMethod || "",
        refunded: o.refunded || false,
        refundedAt: o.refundedAt || null,
        refundType: o.refundType || null,
      }));

      if (ordersToInsert.length > 0) {
        const { error: ordersErr } = await supabase.from("aipc_orders").upsert(ordersToInsert);
        if (ordersErr) throw new Error("Orders migration failed: " + ordersErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
