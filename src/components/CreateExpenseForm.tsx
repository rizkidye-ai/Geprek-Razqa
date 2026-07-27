"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction } from "@/app/(app)/keuangan/pengeluaran/actions";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateExpenseForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [type, setType] = useState<"OPEX" | "CAPEX">("OPEX");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"HARIAN" | "BULANAN">("BULANAN");
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createExpenseAction({
        type,
        category,
        description,
        amount: parseInt(amount || "0", 10),
        frequency,
        date,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCategory("");
      setAmount("");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:grid-cols-2 lg:grid-cols-6"
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "OPEX" | "CAPEX")}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="OPEX">OPEX (Operasional)</option>
        <option value="CAPEX">CAPEX (Modal/Investasi)</option>
      </select>
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        list="expense-categories"
        required
        placeholder="Kategori, mis. Sewa Tempat"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <datalist id="expense-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as "HARIAN" | "BULANAN")}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        title="Bulanan: tidak dihitung per hari di grafik Arus Kas (supaya tidak menumpuk di satu hari). Harian: ikut dihitung per hari."
      >
        <option value="BULANAN">Bulanan</option>
        <option value="HARIAN">Harian</option>
      </select>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        min="1"
        required
        placeholder="Jumlah (Rp)"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        type="date"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Keterangan (opsional)"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      {error && <p className="text-xs text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60 sm:col-span-2 lg:col-span-6 lg:w-auto"
      >
        {isPending ? "Menyimpan..." : "Catat Pengeluaran"}
      </button>
    </form>
  );
}
