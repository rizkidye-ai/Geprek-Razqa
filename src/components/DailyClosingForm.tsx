"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordDailyClosingAction } from "@/app/(app)/keuangan/tutup-kasir/actions";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyClosingForm() {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [kasToko, setKasToko] = useState("");
  const [uangGas, setUangGas] = useState("");
  const [listrik, setListrik] = useState("");
  const [gajiKaryawan, setGajiKaryawan] = useState("");
  const [otherType, setOtherType] = useState<"OPEX" | "CAPEX">("OPEX");
  const [otherCategory, setOtherCategory] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const fd = new FormData();
    fd.set("date", date);
    fd.set("kasToko", kasToko || "0");
    fd.set("uangGas", uangGas || "0");
    fd.set("listrik", listrik || "0");
    fd.set("gajiKaryawan", gajiKaryawan || "0");
    fd.set("otherType", otherType);
    fd.set("otherCategory", otherCategory);
    fd.set("otherAmount", otherAmount || "0");
    fd.set("otherDescription", otherDescription);

    startTransition(async () => {
      const result = await recordDailyClosingAction(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setKasToko("");
      setUangGas("");
      setListrik("");
      setGajiKaryawan("");
      setOtherCategory("");
      setOtherAmount("");
      setOtherDescription("");
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tanggal</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Kas Toko (Rp)</label>
          <input
            value={kasToko}
            onChange={(e) => setKasToko(e.target.value)}
            type="number"
            min="0"
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Uang Gas (Rp)</label>
          <input
            value={uangGas}
            onChange={(e) => setUangGas(e.target.value)}
            type="number"
            min="0"
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Listrik (Rp)</label>
          <input
            value={listrik}
            onChange={(e) => setListrik(e.target.value)}
            type="number"
            min="0"
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Gaji Karyawan (Rp)</label>
          <input
            value={gajiKaryawan}
            onChange={(e) => setGajiKaryawan(e.target.value)}
            type="number"
            min="0"
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold text-gray-700">Pengeluaran Lain (opsional)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={otherType}
            onChange={(e) => setOtherType(e.target.value as "OPEX" | "CAPEX")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="OPEX">OPEX (Operasional)</option>
            <option value="CAPEX">CAPEX (Modal/Investasi)</option>
          </select>
          <input
            value={otherCategory}
            onChange={(e) => setOtherCategory(e.target.value)}
            placeholder="Kategori, mis. Beli Bumbu Tambahan"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={otherAmount}
            onChange={(e) => setOtherAmount(e.target.value)}
            type="number"
            min="0"
            placeholder="Jumlah (Rp)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={otherDescription}
            onChange={(e) => setOtherDescription(e.target.value)}
            placeholder="Keterangan (opsional)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">Tersimpan.</p>}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {isPending ? "Menyimpan..." : "Simpan Tutup Kasir"}
        </button>
      </div>
    </form>
  );
}
