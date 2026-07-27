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
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:grid-cols-2 lg:grid-cols-5"
    >
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

      {error && <p className="text-xs text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      {success && (
        <p className="text-xs text-green-600 sm:col-span-2 lg:col-span-5">Tersimpan.</p>
      )}

      <div className="sm:col-span-2 lg:col-span-5">
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
