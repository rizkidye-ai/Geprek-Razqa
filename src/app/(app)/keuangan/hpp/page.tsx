import Link from "next/link";
import { getMenuItemsWithHpp } from "@/lib/finance";
import { formatRupiah } from "@/lib/format";
import { StatCard } from "@/components/StatCard";

export default async function HppPage() {
  const menuItems = await getMenuItemsWithHpp();

  const activeItems = menuItems.filter((m) => m.isActive);
  const avgMarginPercent =
    activeItems.length > 0
      ? activeItems.reduce((sum, m) => sum + m.marginPercent, 0) / activeItems.length
      : 0;
  const avgHpp =
    activeItems.length > 0 ? activeItems.reduce((sum, m) => sum + m.hpp, 0) / activeItems.length : 0;
  const lowMarginCount = activeItems.filter((m) => m.marginPercent < 30).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">HPP (Harga Pokok Penjualan)</h1>
        <p className="text-sm text-gray-500">
          Biaya bahan baku per menu berdasarkan resep, dibandingkan dengan harga jual
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Rata-rata HPP" value={formatRupiah(Math.round(avgHpp))} accent="blue" />
        <StatCard
          label="Rata-rata Margin"
          value={`${avgMarginPercent.toFixed(1)}%`}
          hint="Margin kotor terhadap harga jual"
          accent={avgMarginPercent >= 40 ? "green" : "orange"}
        />
        <StatCard
          label="Menu Margin Tipis"
          value={String(lowMarginCount)}
          hint="Margin di bawah 30%"
          accent={lowMarginCount > 0 ? "red" : "green"}
        />
      </div>

      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
        HPP dihitung otomatis dari resep bahan baku (Menu &amp; Resep) dikali biaya per satuan bahan
        (diisi di halaman <Link href="/stok" className="underline font-medium">Stok Bahan Baku</Link>).
        Pastikan biaya bahan sudah diisi supaya angka HPP akurat.
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Menu</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">HPP</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-right">Margin</th>
              <th className="px-4 py-3 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((m) => (
              <tr key={m.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 ${!m.isActive ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.categoryName}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatRupiah(Math.round(m.hpp))}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatRupiah(m.price)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatRupiah(Math.round(m.margin))}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      m.marginPercent >= 40
                        ? "bg-green-100 text-green-700"
                        : m.marginPercent >= 20
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.marginPercent.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Belum ada menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
