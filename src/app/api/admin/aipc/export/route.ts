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
    
    // We only want to export books that have > 0 sold, or you can export all
    // Let's export everything for a complete stock report.
    const csvHeader = "ID,TITLE,ISBN,AUTHOR,PRICE,CURRENT QTY,SOLD QTY\n";
    const csvRows = (books || []).map((b: any) => {
      return `${b.id},"${(b.TITLE || "").replace(/"/g, '""')}","${b.ISBN || ""}","${(b.AUTHOR || "").replace(/"/g, '""')}",${b.PRICE},${b["AIPC QTY"] || 0},${b["AIPC Sold"] || 0}`;
    });

    const csvContent = csvHeader + csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="AIPC_Stock_Report_${new Date().toISOString().split("T")[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
