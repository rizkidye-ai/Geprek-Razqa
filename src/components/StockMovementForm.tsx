"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordStockMovementAction } from "@/app/(app)/stok/actions";

type Ingredient = { id: string; name: string; stock: number; unit: string };

export function StockMovementForm({ ingredients }: { ingredients: Ingredient[] }) {
  const router = useRouter();
  const [ingredientId, setIngredientId] = useState("");
  const [type, setType] = useState<"MASUK" | "KELUAR">("MASUK");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selected = ingredients.find((i) => i.id === ingredientId);
  const qtyNum = parseFloat(qty);
  const insufficient =
    type === "KELUAR" && selected && !Number.isNaN(qtyNum) && qtyNum > selected.stock;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!ingredientId) {
      setError("Pilih bahan baku dulu.");
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }
    if (insufficient && selected) {
      setError(
        `Stok ${selected.name} cuma ${selected.stock} ${selected.unit}, tidak cukup untuk dikurangi ${qtyNum}.`,
      );
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("ingredientId", ingredientId);
        fd.set("type", type);
        fd.set("qty", qty);
        fd.set("note", note);
        const result = await recordStockMovementAction(fd);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setIngredientId("");
        setQty("");
        setNote("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan pergerakan stok.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
    >
      <h2 className="text-sm font-semibold text-gray-800">Catat Stok Masuk / Keluar</h2>
      <select
        value={ingredientId}
        onChange={(e) => setIngredientId(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Pilih bahan baku</option>
        {ingredients.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name} (stok: {i.stock} {i.unit})
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "MASUK" | "KELUAR")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="MASUK">Stok Masuk</option>
          <option value="KELUAR">Stok Keluar</option>
        </select>
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          type="number"
          step="0.01"
          min="0"
          placeholder="Jumlah"
          className={`rounded-lg border px-3 py-2 text-sm ${
            insufficient ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
      </div>
      {selected && (
        <p className={`text-xs ${insufficient ? "text-red-500" : "text-gray-400"}`}>
          Stok saat ini: {selected.stock} {selected.unit}
        </p>
      )}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan (mis. pembelian dari supplier, rusak, dsb.)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
