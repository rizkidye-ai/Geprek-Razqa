import { NextRequest, NextResponse } from "next/server";
import { endOfDay, startOfMonth } from "date-fns";
import { auth } from "@/auth";
import { getSalesReport } from "@/lib/reports";
import { formatDateTime } from "@/lib/format";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const start = startParam ? new Date(startParam) : startOfMonth(new Date());
  const end = endParam ? endOfDay(new Date(endParam)) : endOfDay(new Date());

  const report = await getSalesReport(start, end);

  const header = ["No. Pesanan", "Waktu", "Tipe", "Kasir", "Metode", "Total"];
  const rows = report.orders.map((o) => [
    o.orderNumber,
    formatDateTime(o.createdAt),
    o.orderType === "DINE_IN" ? o.table?.number ?? "Dine-in" : "Bawa Pulang",
    o.createdBy.name,
    o.payment?.method ?? "-",
    String(o.payment?.amount ?? 0),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-penjualan-${startParam ?? "bulan-ini"}.csv"`,
    },
  });
}
