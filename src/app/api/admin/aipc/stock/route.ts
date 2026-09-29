import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: books, error } = await supabase
      .from("aipc_books")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    
    // Map Supabase columns back to frontend expected keys, preserving real Supabase ID
    const mappedBooks = (books || []).map((b, index) => ({
      id: b.id,
      index,
      "S. No": index + 1,
      Name: b.TITLE || "",
      SKU: b.AUTHOR || "", 
      MRP: b.PRICE || 0,
      "AIPC Special Price": b.PRICE || 0,
      "AIPC QTY": b["AIPC QTY"] || 0,
      "AIPC Sold": b["AIPC Sold"] || 0,
      ISBN: b.ISBN || ""
    }));

    return NextResponse.json(mappedBooks);
  } catch (error: any) {
    console.error("Error reading AIPC stock from Supabase:", error);
    return NextResponse.json({ error: error?.message || "Failed to read stock data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newBook = await req.json();
    if (!newBook.name || !String(newBook.name).trim()) {
      return NextResponse.json({ error: "Book Title is required" }, { status: 400 });
    }
    
    // Generate next sequential ID safely
    const { data: highest } = await supabase
      .from("aipc_books")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    
    let newId = 100000;
    if (highest && highest.length > 0 && typeof highest[0].id === "number") {
      newId = highest[0].id + 1;
    } else {
      newId = 100000 + Math.floor(Date.now() % 500000);
    }

    const price = Math.max(
      0,
      parseFloat(String(newBook.aipcPrice || newBook.salePrice || newBook.mrp || 0)) || 0
    );
    const qty = Math.max(0, parseInt(String(newBook.qty || 0), 10) || 0);

    const { data, error } = await supabase
      .from("aipc_books")
      .insert({
        id: newId,
        TITLE: String(newBook.name).trim(),
        "AIPC QTY": qty,
        "AIPC Sold": 0,
        ISBN: String(newBook.isbn || "").trim(),
        PRICE: price,
        AUTHOR: String(newBook.sku || "").trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, book: data });
  } catch (error: any) {
    console.error("Error adding book to Supabase:", error);
    return NextResponse.json({ error: error?.message || "Failed to add book" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, index, field, value, soldAdjust, qty, name, mrp, aipcPrice, sku, isbn } = body;

    // Resolve real book ID:
    const bookId = id !== undefined ? Number(id) : (100000 + Number(index));
    
    if (soldAdjust !== undefined) {
      // Fetch current book
      const { data: book, error: fetchErr } = await supabase
        .from("aipc_books")
        .select("*")
        .eq("id", bookId)
        .single();
      if (fetchErr || !book) throw new Error("Book not found");

      const newSold = Math.max(0, (book["AIPC Sold"] || 0) + soldAdjust);
      const newQty = Math.max(0, (book["AIPC QTY"] || 0) - soldAdjust);

      const { error } = await supabase
        .from("aipc_books")
        .update({ "AIPC Sold": newSold, "AIPC QTY": newQty })
        .eq("id", bookId);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Multi-field update or single field update
    const updateObj: Record<string, any> = {};
    if (qty !== undefined) updateObj["AIPC QTY"] = Math.max(0, Number(qty) || 0);
    if (name !== undefined) updateObj["TITLE"] = String(name).trim();
    if (aipcPrice !== undefined) updateObj["PRICE"] = Math.max(0, Number(aipcPrice) || 0);
    else if (mrp !== undefined) updateObj["PRICE"] = Math.max(0, Number(mrp) || 0);
    if (sku !== undefined) updateObj["AUTHOR"] = String(sku).trim();
    if (isbn !== undefined) updateObj["ISBN"] = String(isbn).trim();

    // Single field fallback
    if (field && value !== undefined) {
      let sbField = field;
      if (field === "Name") sbField = "TITLE";
      if (field === "AIPC Special Price" || field === "MRP") sbField = "PRICE";
      if (field === "SKU") sbField = "AUTHOR";
      updateObj[sbField] = value;
    }

    if (Object.keys(updateObj).length > 0) {
      const { error } = await supabase
        .from("aipc_books")
        .update(updateObj)
        .eq("id", bookId);
        
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating book in Supabase:", error);
    return NextResponse.json({ error: error?.message || "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let bookId: number | null = null;
    const { searchParams } = new URL(req.url);
    if (searchParams.has("id")) bookId = Number(searchParams.get("id"));
    else if (searchParams.has("index")) bookId = 100000 + parseInt(searchParams.get("index")!);

    // Also check request body if not in query
    if (!bookId) {
      const body = await req.json().catch(() => ({}));
      if (body.id !== undefined) bookId = Number(body.id);
      else if (body.index !== undefined) bookId = 100000 + Number(body.index);
    }

    if (!bookId) return NextResponse.json({ error: "Missing book id" }, { status: 400 });

    const { error } = await supabase
      .from("aipc_books")
      .delete()
      .eq("id", bookId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting book in Supabase:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete book" }, { status: 500 });
  }
}
