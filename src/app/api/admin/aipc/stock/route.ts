import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminGuard";

const DATA_PATH = () => path.join(process.cwd(), "src/data/aipc_books.json");

function readBooks() {
  return JSON.parse(fs.readFileSync(DATA_PATH(), "utf8"));
}

function writeBooks(books: any[]) {
  fs.writeFileSync(DATA_PATH(), JSON.stringify(books, null, 2), "utf8");
}

// GET — return all AIPC books
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(readBooks());
}

// PATCH — update stock of an existing book by index
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { index, qty, name, mrp, aipcPrice, soldAdjust } = await req.json();
  const books = readBooks();
  if (index === undefined || !books[index]) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (typeof qty === "number") books[index]["AIPC QTY"] = Math.max(0, qty);
  if (name) books[index]["Name"] = name;
  if (typeof mrp === "number") books[index]["MRP"] = mrp;
  if (typeof aipcPrice === "number") books[index]["AIPC Special Price"] = aipcPrice;

  // Return / sold adjustment: soldAdjust = -1 means 1 book returned
  if (typeof soldAdjust === "number") {
    const currentSold = books[index]["AIPC Sold"] || 0;
    const currentQty = books[index]["AIPC QTY"] || 0;
    const newSold = Math.max(0, currentSold + soldAdjust);
    const delta = currentSold - newSold; // how many were "un-sold"
    books[index]["AIPC Sold"] = newSold;
    books[index]["AIPC QTY"] = Math.max(0, currentQty + delta); // put them back in stock
  }

  writeBooks(books);
  return NextResponse.json({ success: true, book: books[index] });
}

// POST — add a brand new book
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, sku, isbn, mrp, salePrice, aipcPrice, qty } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const books = readBooks();
  const newBook = {
    "S. No": books.length + 1,
    "SKU": sku || "",
    "Name": name,
    "MRP": mrp || 0,
    "ISBN": isbn || "",
    "Sale Price": salePrice || 0,
    "AIPC Special Price": aipcPrice || 0,
    "AIPC QTY": qty || 0,
    "AIPC Sold": 0,
  };
  books.push(newBook);
  writeBooks(books);
  return NextResponse.json({ success: true, book: newBook, index: books.length - 1 });
}

// DELETE — remove a book by index and re-number S. No
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { index } = await req.json();
  const books = readBooks();
  if (index === undefined || !books[index]) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  books.splice(index, 1);
  // Re-number S. No sequentially after deletion
  books.forEach((b: any, i: number) => { b["S. No"] = i + 1; });
  writeBooks(books);
  return NextResponse.json({ success: true });
}
