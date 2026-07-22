import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getBepRoiAnalysis } from "@/lib/finance";
import { formatRupiah } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { InfoTooltip } from "@/components/InfoTooltip";
import { format, startOfMonth, endOfDay } from "date-fns";

const verdictConfig = {
  LAYAK: {
    label: "Layak",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    desc: "Bisnis menghasilkan laba dan modal diperkirakan kembali dalam waktu wajar (≤ 24 bulan).",
  },
  CUKUP_LAYAK: {
    label: "Cukup Layak",
    icon: AlertTriangle,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    desc: "Bisnis menghasilkan laba, tapi waktu pengembalian modal cukup lama atau data investasi belum lengkap.",
  },
  BELUM_LAYAK: {
    label: "Belum Layak",
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    desc: "Bisnis masih merugi pada periode ini. Evaluasi harga jual, HPP, atau biaya operasional.",
  },
} as const;

export default async function KelayakanPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const start = params.start ? new Date(params.start) : startOfMonth(new Date());
  const end = params.end ? endOfDay(new Date(params.end)) : endOfDay(new Date());
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const a = await getBepRoiAnalysis(start, end);
  const v = verdictConfig[a.verdict];
  const VerdictIcon = v.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center text-xl font-bold text-gray-900">
            BEP, ROI &amp; Kelayakan Bisnis
            <InfoTooltip text="BEP (Break Even Point) = minimal penjualan supaya tidak rugi. ROI (Return on Investment) = persentase pengembalian dari total modal (CAPEX) yang sudah dikeluarkan. Payback Period = estimasi lama modal kembali. Indikasi Kelayakan = kesimpulan otomatis dari angka-angka ini — bukan pengganti konsultasi profesional." />
          </h1>
          <p className="text-sm text-gray-500">Analisis titik impas dan pengembalian modal</p>
        </div>
        <form className="flex items-center gap-2" action="/keuangan/kelayakan">
          <input type="date" name="start" defaultValue={startStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <span className="text-sm text-gray-400">s/d</span>
          <input type="date" name="end" defaultValue={endStr} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            Terapkan
          </button>
        </form>
      </div>

      <div className={`rounded-2xl border p-4 ${v.bg}`}>
        <div className={`mb-1 flex items-center gap-2 font-semibold ${v.color}`}>
          <VerdictIcon size={20} />
          Indikasi: {v.label}
        </div>
        <p className={`text-sm ${v.color}`}>{v.desc}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="BEP (Unit Porsi)"
          value={a.bepUnits !== null ? `${Math.ceil(a.bepUnits)} porsi` : "-"}
          hint="Minimal porsi terjual untuk balik modal biaya periode ini"
          accent="blue"
        />
        <StatCard
          label="BEP (Rupiah)"
          value={a.bepRupiah !== null ? formatRupiah(Math.ceil(a.bepRupiah)) : "-"}
          hint="Minimal omzet untuk balik modal biaya periode ini"
          accent="blue"
        />
        <StatCard
          label="ROI Periode Ini"
          value={a.roiPercent !== null ? `${a.roiPercent.toFixed(1)}%` : "-"}
          hint={`dari total investasi ${formatRupiah(a.totalInvestment)}`}
          accent={a.roiPercent !== null && a.roiPercent > 0 ? "green" : "red"}
        />
        <StatCard
          label="Payback Period"
          value={a.paybackMonths !== null ? `${a.paybackMonths.toFixed(1)} bulan` : "-"}
          hint="Estimasi lama modal kembali (proyeksi bulanan)"
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Rincian Perhitungan BEP</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Biaya Tetap (OPEX periode ini)</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(a.fixedCosts)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Rata-rata Harga Jual / Porsi</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(Math.round(a.avgPrice))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Rata-rata Biaya Variabel (HPP) / Porsi</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(Math.round(a.avgVariableCost))}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <dt className="text-gray-500">Margin Kontribusi / Porsi</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(Math.round(a.contributionMargin))}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Rincian ROI &amp; Payback</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Investasi (CAPEX)</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(a.totalInvestment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Laba Bersih Periode Ini</dt>
              <dd className={`font-medium ${a.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatRupiah(a.netProfit)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Estimasi Laba Bersih / Bulan</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(Math.round(a.monthlyNetProfit))}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <dt className="text-gray-500">Periode Data</dt>
              <dd className="font-medium text-gray-900">{a.periodDays} hari</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500">
        <strong>Disclaimer:</strong> Perhitungan ini adalah estimasi otomatis berdasarkan data transaksi,
        HPP, dan pengeluaran yang tercatat di sistem pada periode yang dipilih. Angka proyeksi bulanan
        mengasumsikan performa periode ini berlanjut konsisten. Ini bukan pengganti analisis kelayakan
        bisnis profesional atau konsultasi dengan akuntan/konsultan keuangan.
      </div>
    </div>
  );
}
