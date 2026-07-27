import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";
import { deleteExpenseAction } from "./actions";
import { InfoTooltip } from "@/components/InfoTooltip";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

const capexCategories = ["Peralatan Dapur", "Renovasi Tempat", "Meja & Kursi", "Kendaraan", "Lainnya"];
const opexCategories = ["Sewa Tempat", "Listrik & Air", "Gas LPG", "Gaji Karyawan", "Internet", "Lainnya"];

export default async function PengeluaranPage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [expenses, capexTotal, opexThisMonth, opexLastMonth] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { createdBy: true },
    }),
    prisma.expense.aggregate({ where: { type: "CAPEX" }, _sum: { amount: true } }),
    prisma.expense.aggregate({
      where: { type: "OPEX", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { type: "OPEX", date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-xl font-bold text-gray-900">
          CAPEX &amp; OPEX
          <InfoTooltip text="CAPEX = pengeluaran modal/investasi yang sekali beli dan dipakai lama (peralatan, renovasi, kendaraan). OPEX = biaya operasional rutin yang berulang tiap periode (sewa, listrik, gas, gaji). Frekuensi 'Bulanan' berarti jumlahnya adalah total satu bulan sekaligus (mis. sewa tempat) — tidak dihitung per hari di grafik Arus Kas supaya tidak menumpuk di satu tanggal. Frekuensi 'Harian' ikut dihitung per hari (cocok untuk biaya yang memang dicatat tiap hari lewat Tutup Kasir Harian). Catatan di sini jadi dasar perhitungan Laba Rugi, Arus Kas, dan ROI." />
        </h1>
        <p className="text-sm text-gray-500">
          Catat pengeluaran modal (investasi) dan operasional (biaya rutin) warung
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total CAPEX (Investasi)" value={formatRupiah(capexTotal._sum.amount ?? 0)} accent="blue" />
        <StatCard label="OPEX Bulan Ini" value={formatRupiah(opexThisMonth._sum.amount ?? 0)} accent="orange" />
        <StatCard label="OPEX Bulan Lalu" value={formatRupiah(opexLastMonth._sum.amount ?? 0)} accent="green" />
      </div>

      <CreateExpenseForm categories={Array.from(new Set([...capexCategories, ...opexCategories]))} />

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Frekuensi</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(e.date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      e.type === "CAPEX" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {e.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{e.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      e.frequency === "BULANAN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                    }`}
                    title={
                      e.frequency === "BULANAN"
                        ? "Tidak dihitung per hari di grafik Arus Kas"
                        : "Ikut dihitung per hari di grafik Arus Kas"
                    }
                  >
                    {e.frequency === "BULANAN" ? "Bulanan" : "Harian"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{e.description || "-"}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatRupiah(e.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Belum ada pengeluaran tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
