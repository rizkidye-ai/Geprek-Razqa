import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { SalesChart } from "@/components/SalesChart";
import { format, startOfMonth, endOfDay } from "date-fns";

export default async function ArusKasPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const start = params.start ? new Date(params.start) : startOfMonth(new Date());
  const end = params.end ? endOfDay(new Date(params.end)) : endOfDay(new Date());
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: start, lte: end } },
      include: { order: true },
      orderBy: { paidAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
    }),
  ]);

  const kasMasuk = payments.reduce((sum, p) => sum + p.amount, 0);
  const kasKeluar = expenses.reduce((sum, e) => sum + e.amount, 0);
  const arusBersih = kasMasuk - kasKeluar;

  type Row = { date: Date; type: "in" | "out"; category: string; description: string; amount: number };
  const rows: Row[] = [
    ...payments.map((p) => ({
      date: p.paidAt,
      type: "in" as const,
      category: "Penjualan",
      description: p.order.orderNumber,
      amount: p.amount,
    })),
    ...expenses.map((e) => ({
      date: e.date,
      type: "out" as const,
      category: `${e.type} - ${e.category}`,
      description: e.description || "-",
      amount: e.amount,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const byDayMap = new Map<string, number>();
  for (const p of payments) {
    const key = format(p.paidAt, "yyyy-MM-dd");
    byDayMap.set(key, (byDayMap.get(key) ?? 0) + p.amount);
  }
  for (const e of expenses) {
    const key = format(e.date, "yyyy-MM-dd");
    byDayMap.set(key, (byDayMap.get(key) ?? 0) - e.amount);
  }
  const chartData = Array.from(byDayMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date: format(new Date(date), "dd/MM"), total }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Arus Kas</h1>
          <p className="text-sm text-gray-500">Kas masuk (penjualan) vs kas keluar (CAPEX &amp; OPEX)</p>
        </div>
        <form className="flex items-center gap-2" action="/keuangan/arus-kas">
          <input type="date" name="start" defaultValue={startStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <span className="text-sm text-gray-400">s/d</span>
          <input type="date" name="end" defaultValue={endStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            Terapkan
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Kas Masuk" value={formatRupiah(kasMasuk)} accent="green" />
        <StatCard label="Kas Keluar" value={formatRupiah(kasKeluar)} accent="red" />
        <StatCard
          label="Arus Kas Bersih"
          value={formatRupiah(arusBersih)}
          accent={arusBersih >= 0 ? "green" : "red"}
          hint={arusBersih >= 0 ? "Surplus" : "Defisit"}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Arus Kas Bersih Harian</h2>
        <SalesChart data={chartData} />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-gray-700">{r.category}</td>
                <td className="px-4 py-3 text-gray-500">{r.description}</td>
                <td className={`px-4 py-3 text-right font-medium ${r.type === "in" ? "text-green-600" : "text-red-600"}`}>
                  {r.type === "in" ? "+" : "-"}
                  {formatRupiah(r.amount)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada transaksi kas pada periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
