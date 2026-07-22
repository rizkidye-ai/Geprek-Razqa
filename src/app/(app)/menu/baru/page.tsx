import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RecipeEditor } from "@/components/RecipeEditor";
import { SubmitButton } from "@/components/SubmitButton";
import { createMenuItemAction } from "../actions";

export default async function TambahMenuPage() {
  const [categories, ingredients] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/menu" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Kembali ke Menu
      </Link>
      <h1 className="text-xl font-bold text-gray-900">Tambah Menu Baru</h1>

      <form action={createMenuItemAction} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Menu</label>
          <input
            name="name"
            required
            placeholder="Ayam Geprek Sambal Matah"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Deskripsi singkat menu"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Harga (Rp)</label>
            <input
              name="price"
              type="number"
              min="0"
              required
              placeholder="15000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select
              name="categoryId"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">URL Gambar (opsional)</label>
          <input
            name="imageUrl"
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Resep Bahan Baku (per porsi)
          </label>
          <RecipeEditor ingredients={ingredients} />
          <p className="mt-2 text-xs text-gray-400">
            Stok bahan akan otomatis berkurang sesuai resep saat pesanan diselesaikan.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/menu"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </Link>
          <SubmitButton>Simpan Menu</SubmitButton>
        </div>
      </form>
    </div>
  );
}
