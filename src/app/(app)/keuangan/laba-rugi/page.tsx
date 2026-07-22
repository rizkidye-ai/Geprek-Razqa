import { getIncomeStatement } from "@/lib/finance";
import { formatRupiah } from "@/lib/format";
import { InfoTooltip } from "@/components/InfoTooltip";
import { format, startOfMonth, endOfDay } from "date-fns";

export default async function LabaRugiPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const start = params.start ? new Date(params.start) : startOfMonth(new Date());
  const end = params.end ? endOfDay(new Date(params.end)) : endOfDay(new Date());
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const income = await getIncomeStatement(start, end);
  const grossMarginPercent = income.revenue > 0 ? (income.grossProfit / income.revenue) * 100 : 0;
  const netMarginPercent = income.revenue > 0 ? (income.netProfit / income.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center text-xl font-bold text-gray-900">
            Laba Rugi
            <InfoTooltip text="Pendapatan (dari penjualan) dikurangi HPP jadi Laba Kotor, lalu dikurangi biaya operasional (OPEX) jadi Laba Bersih. Ini laporan untung-rugi warung untuk periode yang dipilih. CAPEX tidak masuk di sini — lihat halaman BEP/ROI untuk itu." />
          </h1>
          <p className="text-sm text-gray-500">Pendapatan, HPP, biaya operasional, dan laba bersih</p>
        </div>
        <form className="flex items-center gap-2" action="/keuangan/laba-rugi">
          <input type="date" name="start" defaultValue={startStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <span className="text-sm text-gray-400">s/d</span>
          <input type="date" name="end" defaultValue={endStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            Terapkan
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-center text-sm font-semibold text-gray-500">
          Laporan Laba Rugi · {format(start, "d MMM yyyy")} – {format(end, "d MMM yyyy")}
        </h2>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Pendapatan (Penjualan)</span>
            <span className="font-medium text-gray-900">{formatRupiah(income.revenue)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">HPP (Harga Pokok Penjualan)</span>
            <span className="font-medium text-red-600">({formatRupiah(income.cogs)})</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 py-2 font-semibold">
            <span className="text-gray-800">Laba Kotor</span>
            <span className="text-gray-900">{formatRupiah(income.grossProfit)}</span>
          </div>
          <p className="pb-2 text-xs text-gray-400">Margin kotor: {grossMarginPercent.toFixed(1)}%</p>

          <div className="flex justify-between py-1">
            <span className="text-gray-600">Biaya Operasional (OPEX)</span>
            <span className="font-medium text-red-600">({formatRupiah(income.opex)})</span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-800 py-3 text-base font-bold">
            <span className="text-gray-900">Laba Bersih</span>
            <span className={income.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
              {formatRupiah(income.netProfit)}
            </span>
          </div>
          <p className="text-xs text-gray-400">Margin bersih: {netMarginPercent.toFixed(1)}%</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <p>Jumlah transaksi: <span className="font-medium text-gray-700">{income.orderCount}</span></p>
          <p>Porsi terjual: <span className="font-medium text-gray-700">{income.unitsSold}</span></p>
        </div>

        <p className="mt-4 rounded-lg bg-gray-50 p-2 text-xs text-gray-400">
          Catatan: CAPEX (investasi/modal) tidak dihitung sebagai biaya bulanan di laporan ini —
          lihat halaman <span className="font-medium">BEP, ROI &amp; Kelayakan Bisnis</span> untuk
          analisis pengembalian modal.
        </p>
      </div>
    </div>
  );
}
