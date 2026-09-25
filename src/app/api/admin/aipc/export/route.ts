import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dataPath = path.join(process.cwd(), "src/data/aipc_books.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const books = JSON.parse(fileContent);

    // Create CSV header
    let csv = "S. No,SKU,Name,MRP,ISBN,Sale Price,AIPC Special Price,Initial QTY,Sold QTY,Remaining QTY\n";

    for (const b of books) {
      const soldQty = b["AIPC Sold"] || 0;
      const remainingQty = b["AIPC QTY"] || 0;
      const initialQty = soldQty + remainingQty;
      
      const row = [
        b["S. No"],
        b.SKU,
        `"${String(b.Name || "").replace(/"/g, '""')}"`, // escape quotes
        b.MRP,
        b.ISBN,
        b["Sale Price"],
        b["AIPC Special Price"],
        initialQty,
        soldQty,
        remainingQty
      ];
      csv += row.join(",") + "\n";
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="aipc_stock_report_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
