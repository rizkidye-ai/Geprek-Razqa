import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleMenuItemActiveAction,
  deleteMenuItemAction,
} from "./actions";

export default async function MenuPage() {
  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.menuItem.findMany({
      include: { category: true, ingredients: { include: { ingredient: true } } },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu & Resep</h1>
          <p className="text-sm text-gray-500">Kelola daftar menu, harga, dan resep bahan baku per porsi</p>
        </div>
        <Link
          href="/menu/baru"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20"
        >
          <Plus size={16} /> Tambah Menu
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Kategori Menu</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
            >
              {c.name}
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-gray-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </form>
            </span>
          ))}
        </div>
        <form action={createCategoryAction} className="flex max-w-sm gap-2">
          <input
            name="name"
            placeholder="Nama kategori baru"
            required
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <SubmitButton className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
            Tambah
          </SubmitButton>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Menu</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Resep</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400">{item.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.category.name}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatRupiah(item.price)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {item.ingredients.length === 0
                    ? "-"
                    : item.ingredients
                        .map((mi) => `${mi.ingredient.name} ${mi.qtyPerPortion}${mi.ingredient.unit}`)
                        .join(", ")}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleMenuItemActiveAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/menu/${item.id}`}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteMenuItemAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Belum ada menu. Tambahkan menu pertama Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
