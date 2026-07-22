import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
import { formatRupiah } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { SalesChart } from "@/components/SalesChart";
import { InfoTooltip } from "@/components/InfoTooltip";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-xl font-bold text-gray-900">
          Dashboard
          <InfoTooltip text="Ringkasan cepat kondisi warung hari ini: omzet, jumlah pesanan per status, menu paling laris, dan bahan baku yang mulai menipis. Halaman pertama yang dilihat setelah login." />
        </h1>
        <p className="text-sm text-gray-500">Ringkasan operasional Warung Makan Geprek Rzqa hari ini</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Omzet Hari Ini"
          value={formatRupiah(data.totalOmzetHariIni)}
          hint={`${data.jumlahTransaksiHariIni} transaksi selesai`}
          accent="green"
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={String(data.ordersToday)}
          hint="Termasuk semua status"
          accent="orange"
        />
        <StatCard
          label="Sedang Diproses"
          value={String(data.statusCounts.BARU + data.statusCounts.DIPROSES + data.statusCounts.SIAP)}
          hint={`Baru ${data.statusCounts.BARU} · Diproses ${data.statusCounts.DIPROSES} · Siap ${data.statusCounts.SIAP}`}
          accent="blue"
        />
        <StatCard
          label="Stok Menipis"
          value={String(data.lowStock.length)}
          hint="Bahan baku perlu restock"
          accent={data.lowStock.length > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Penjualan 7 Hari Terakhir</h2>
          <SalesChart data={data.chartData} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Menu Terlaris</h2>
          {data.topMenu.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada data penjualan.</p>
          ) : (
            <ol className="space-y-2">
              {data.topMenu.map((m, idx) => (
                <li key={m.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600">
                      {idx + 1}
                    </span>
                    {m.name}
                  </span>
                  <span className="font-medium text-gray-600">{m.qty} porsi</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-red-700">
            <AlertTriangle size={18} />
            <h2 className="text-sm font-semibold">Peringatan Stok Menipis</h2>
          </div>
          <ul className="grid grid-cols-2 gap-2 text-sm text-red-700 lg:grid-cols-4">
            {data.lowStock.map((i) => (
              <li key={i.id} className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-red-500">
                  Sisa {i.stock} {i.unit} (min. {i.minStock} {i.unit})
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/stok"
            className="mt-3 inline-block text-xs font-medium text-red-700 underline underline-offset-2"
          >
            Kelola stok bahan baku &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
