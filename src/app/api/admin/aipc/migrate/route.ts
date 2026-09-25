import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    // 1. Migrate Books Correctly
    const booksPath = path.join(process.cwd(), "src/data/aipc_books.json");
    if (fs.existsSync(booksPath)) {
      const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
      // Ensure they all have an ID
      const booksToInsert = books.map((b: any, index: number) => {
        // Handle exact mapping from the Excel/JSON
        return {
          id: 100000 + index,
          TITLE: b.Name || b.TITLE || "Unknown",
          "AIPC QTY": typeof b["AIPC QTY"] === "number" ? b["AIPC QTY"] : 0,
          "AIPC Sold": typeof b["AIPC Sold"] === "number" ? b["AIPC Sold"] : 0,
          ISBN: String(b.ISBN || ""),
          PRICE: b["AIPC Special Price"] || b.PRICE || 0,
          AUTHOR: b.SKU || b.AUTHOR || "", // using AUTHOR column to store SKU since we didn't make a SKU column
        };
      });
      
      const { error: booksErr } = await supabase.from("aipc_books").upsert(booksToInsert);
      if (booksErr) throw new Error("Books migration failed: " + booksErr.message);
    }

    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
