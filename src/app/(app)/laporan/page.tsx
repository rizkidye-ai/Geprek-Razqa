import { Download } from "lucide-react";
import { getSalesReport } from "@/lib/reports";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { SalesChart } from "@/components/SalesChart";
import { format, startOfMonth, endOfDay } from "date-fns";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const start = params.start ? new Date(params.start) : startOfMonth(new Date());
  const end = params.end ? endOfDay(new Date(params.end)) : endOfDay(new Date());

  const report = await getSalesReport(start, end);

  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan Penjualan</h1>
          <p className="text-sm text-gray-500">Analisis omzet dan transaksi warung</p>
        </div>
        <form className="flex items-center gap-2" action="/laporan">
          <input
            type="date"
            name="start"
            defaultValue={startStr}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <span className="text-sm text-gray-400">s/d</span>
          <input
            type="date"
            name="end"
            defaultValue={endStr}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Terapkan
          </button>
          <a
            href={`/laporan/export?start=${startStr}&end=${endStr}`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Download size={14} /> Export CSV
          </a>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Omzet" value={formatRupiah(report.totalOmzet)} accent="green" />
        <StatCard label="Total Transaksi" value={String(report.totalTransaksi)} accent="orange" />
        <StatCard label="Rata-rata/Transaksi" value={formatRupiah(report.rataRata)} accent="blue" />
        <StatCard
          label="Tunai / QRIS / Transfer"
          value={`${Math.round((report.byMethod.TUNAI / (report.totalOmzet || 1)) * 100)}%`}
          hint={`QRIS ${formatRupiah(report.byMethod.QRIS)} · Transfer ${formatRupiah(report.byMethod.TRANSFER)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Grafik Omzet Harian</h2>
          <SalesChart data={report.chartData} />
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Menu Terlaris (Periode Ini)</h2>
          <div className="space-y-2">
            {report.topMenu.map((m, idx) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span>
                  {idx + 1}. {m.name}
                </span>
                <span className="text-gray-500">{m.qty} porsi</span>
              </div>
            ))}
            {report.topMenu.length === 0 && (
              <p className="text-sm text-gray-400">Tidak ada data pada periode ini.</p>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">No. Pesanan</th>
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Kasir</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {report.orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {o.orderType === "DINE_IN" ? o.table?.number ?? "Dine-in" : "Bawa Pulang"}
                </td>
                <td className="px-4 py-3 text-gray-500">{o.createdBy.name}</td>
                <td className="px-4 py-3 text-gray-500">{o.payment?.method ?? "-"}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatRupiah(o.payment?.amount ?? 0)}
                </td>
              </tr>
            ))}
            {report.orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada transaksi pada periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
