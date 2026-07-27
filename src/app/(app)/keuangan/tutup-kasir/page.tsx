import Link from "next/link";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { InfoTooltip } from "@/components/InfoTooltip";
import { DailyClosingForm } from "@/components/DailyClosingForm";
import { deleteCashReserveAction } from "./actions";

export default async function TutupKasirPage() {
  const [reserves, totalReserve] = await Promise.all([
    prisma.cashReserve.findMany({ orderBy: { date: "desc" }, take: 30 }),
    prisma.cashReserve.aggregate({ _sum: { amount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-xl font-bold text-gray-900">
          Tutup Kasir Harian
          <InfoTooltip text="Catat cepat setiap tutup toko: uang Kas Toko yang disisihkan (bukan biaya — tetap milik usaha, cuma disimpan), plus biaya Gas, Listrik, dan Gaji Karyawan hari itu. Uang Gas/Listrik/Gaji otomatis tercatat sebagai OPEX di halaman CAPEX & OPEX supaya Laba Rugi & BEP tetap akurat. Kas Toko dicatat terpisah di sini karena bukan pengeluaran." />
        </h1>
        <p className="text-sm text-gray-500">
          Catat alokasi kas toko, uang gas, listrik, dan gaji karyawan setiap tutup toko
        </p>
      </div>

      <StatCard
        label="Total Kas Toko Tersimpan"
        value={formatRupiah(totalReserve._sum.amount ?? 0)}
        hint="Uang cadangan yang disisihkan, tetap milik usaha"
        accent="green"
      />

      <DailyClosingForm />

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reserves.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-gray-500">{r.note || "-"}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatRupiah(r.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCashReserveAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {reserves.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Belum ada catatan kas toko.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Uang Gas, Listrik, dan Gaji Karyawan yang dicatat di atas otomatis muncul juga di halaman{" "}
        <Link href="/keuangan/pengeluaran" className="underline">
          CAPEX &amp; OPEX
        </Link>{" "}
        sebagai OPEX.
      </p>
    </div>
  );
}
