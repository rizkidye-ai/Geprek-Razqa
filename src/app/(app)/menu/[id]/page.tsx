import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RecipeEditor } from "@/components/RecipeEditor";
import { SubmitButton } from "@/components/SubmitButton";
import { updateMenuItemAction } from "../actions";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, ingredients, item] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.menuItem.findUnique({
      where: { id },
      include: { ingredients: true },
    }),
  ]);

  if (!item) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/menu" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Kembali ke Menu
      </Link>
      <h1 className="text-xl font-bold text-gray-900">Edit Menu: {item.name}</h1>

      <form action={updateMenuItemAction} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={item.id} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Menu</label>
          <input
            name="name"
            required
            defaultValue={item.name}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={item.description ?? ""}
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
              defaultValue={item.price}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select
              name="categoryId"
              required
              defaultValue={item.categoryId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
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
            defaultValue={item.imageUrl ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Resep Bahan Baku (per porsi)
          </label>
          <RecipeEditor
            ingredients={ingredients}
            initialRecipe={item.ingredients.map((mi) => ({
              ingredientId: mi.ingredientId,
              qtyPerPortion: mi.qtyPerPortion,
            }))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/menu"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </Link>
          <SubmitButton>Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
