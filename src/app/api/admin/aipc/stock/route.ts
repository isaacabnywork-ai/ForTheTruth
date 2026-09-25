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
    return NextResponse.json(books || []);
  } catch (error) {
    console.error("Error reading AIPC stock from Supabase:", error);
    return NextResponse.json({ error: "Failed to read stock data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newBook = await req.json();
    
    // Generate a new ID (highest current ID + 1, or 100000)
    const { data: highest } = await supabase
      .from("aipc_books")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    
    let newId = 100000;
    if (highest && highest.length > 0) {
      newId = highest[0].id + 1;
    }

    const { data, error } = await supabase
      .from("aipc_books")
      .insert({
        id: newId,
        TITLE: newBook.TITLE || "",
        "AIPC QTY": newBook["AIPC QTY"] || 0,
        "AIPC Sold": newBook["AIPC Sold"] || 0,
        ISBN: newBook.ISBN || "",
        PRICE: newBook.PRICE || 0,
        AUTHOR: newBook.AUTHOR || "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, book: data });
  } catch (error) {
    console.error("Error adding book to Supabase:", error);
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { index, field, value, soldAdjust } = await req.json();

    // Since 'index' from frontend was based on array index (id = 100000 + index)
    const bookId = 100000 + index;
    
    if (soldAdjust !== undefined) {
      // Fetch current book
      const { data: book } = await supabase.from("aipc_books").select("*").eq("id", bookId).single();
      if (!book) throw new Error("Book not found");

      const newSold = Math.max(0, (book["AIPC Sold"] || 0) + soldAdjust);
      const newQty = Math.max(0, (book["AIPC QTY"] || 0) - soldAdjust);

      const { error } = await supabase
        .from("aipc_books")
        .update({ "AIPC Sold": newSold, "AIPC QTY": newQty })
        .eq("id", bookId);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Normal field update
    const { error } = await supabase
      .from("aipc_books")
      .update({ [field]: value })
      .eq("id", bookId);
      
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating book in Supabase:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const indexStr = searchParams.get("index");
    if (indexStr === null) return NextResponse.json({ error: "Missing index" }, { status: 400 });

    const bookId = 100000 + parseInt(indexStr);

    const { error } = await supabase
      .from("aipc_books")
      .delete()
      .eq("id", bookId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book in Supabase:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
