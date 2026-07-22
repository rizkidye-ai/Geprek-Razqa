import { Save, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createIngredientAction,
  deleteIngredientAction,
  recordStockMovementAction,
  updateIngredientAction,
} from "./actions";

export default async function StokPage() {
  const [ingredients, movements] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { ingredient: true, createdBy: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Stok Bahan Baku</h1>
        <p className="text-sm text-gray-500">
          Pantau stok, catat barang masuk/keluar, dan cegah kehabisan bahan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form action={recordStockMovementAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Catat Stok Masuk / Keluar</h2>
          <select
            name="ingredientId"
            required
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
            <select name="type" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="MASUK">Stok Masuk</option>
              <option value="KELUAR">Stok Keluar</option>
            </select>
            <input
              name="qty"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Jumlah"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            name="note"
            placeholder="Catatan (mis. pembelian dari supplier, rusak, dsb.)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <SubmitButton className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60">
            Simpan
          </SubmitButton>
        </form>

        <form action={createIngredientAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Tambah Bahan Baku Baru</h2>
          <input
            name="name"
            required
            placeholder="Nama bahan, mis. Ayam Fillet"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              name="unit"
              required
              placeholder="Satuan (gram)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="stock"
              type="number"
              step="0.01"
              min="0"
              placeholder="Stok awal"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="minStock"
              type="number"
              step="0.01"
              min="0"
              placeholder="Stok minimum"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            name="costPerUnit"
            type="number"
            step="0.01"
            min="0"
            placeholder="Biaya per satuan (Rp), mis. harga per gram"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <SubmitButton className="w-full rounded-lg bg-gray-800 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            Tambah Bahan
          </SubmitButton>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Bahan Baku</th>
              <th className="px-4 py-3">Stok Saat Ini</th>
              <th className="px-4 py-3">Stok Minimum</th>
              <th className="px-4 py-3">Biaya per Satuan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((i) => {
              const low = i.stock <= i.minStock;
              return (
                <tr key={i.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {i.stock} {i.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {i.minStock} {i.unit}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateIngredientAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="minStock" value={i.minStock} />
                      <span className="text-xs text-gray-400">Rp</span>
                      <input
                        name="costPerUnit"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={i.costPerUnit}
                        className="w-20 rounded border border-gray-200 px-1.5 py-1 text-xs"
                      />
                      <span className="text-xs text-gray-400">/{i.unit}</span>
                      <button
                        type="submit"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Simpan biaya"
                      >
                        <Save size={13} />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        low ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {low ? "Menipis" : "Aman"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteIngredientAction}>
                      <input type="hidden" name="id" value={i.id} />
                      <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {ingredients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Belum ada bahan baku.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Riwayat Stok Terbaru</h2>
        <div className="space-y-2">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm last:border-0">
              <div>
                <p className="font-medium text-gray-800">
                  {m.ingredient.name}{" "}
                  <span className={m.type === "MASUK" ? "text-green-600" : "text-red-600"}>
                    {m.type === "MASUK" ? "+" : "-"}
                    {m.qty} {m.ingredient.unit}
                  </span>
                </p>
                {m.note && <p className="text-xs text-gray-400">{m.note}</p>}
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>{m.createdBy.name}</p>
                <p>{formatDateTime(m.createdAt)}</p>
              </div>
            </div>
          ))}
          {movements.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada riwayat pergerakan stok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
