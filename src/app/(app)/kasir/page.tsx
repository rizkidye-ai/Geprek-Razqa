import { prisma } from "@/lib/prisma";
import { KasirClient } from "@/components/KasirClient";

export default async function KasirPage() {
  const [menuItems, tables] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.restaurantTable.findMany({ orderBy: { number: "asc" } }),
  ]);

  const menuData = menuItems.map((m) => ({
    id: m.id,
    name: m.name,
    price: m.price,
    categoryId: m.categoryId,
    categoryName: m.category.name,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kasir (POS)</h1>
        <p className="text-sm text-gray-500">Buat pesanan baru dan proses pembayaran</p>
      </div>
      <KasirClient menuItems={menuData} tables={tables} />
    </div>
  );
}
