import { Trash2, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/SubmitButton";
import { createTableAction, deleteTableAction, setTableStatusAction } from "./actions";

export default async function MejaPage() {
  const tables = await prisma.restaurantTable.findMany({
    orderBy: { number: "asc" },
    include: {
      orders: {
        where: { status: { in: ["BARU", "DIPROSES", "SIAP"] } },
        select: { id: true, orderNumber: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Meja</h1>
        <p className="text-sm text-gray-500">Kelola meja dine-in dan status ketersediaannya</p>
      </div>

      <form action={createTableAction} className="flex max-w-md flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-gray-600">Nama/Nomor Meja</label>
          <input
            name="number"
            required
            placeholder="Meja 9"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs font-medium text-gray-600">Kapasitas</label>
          <input
            name="capacity"
            type="number"
            min="1"
            defaultValue={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton>Tambah Meja</SubmitButton>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((t) => (
          <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-gray-900">{t.number}</p>
              <form action={deleteTableAction}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
            <p className="mb-3 flex items-center gap-1 text-xs text-gray-500">
              <Users size={12} /> {t.capacity} orang
            </p>
            <span
              className={`mb-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                t.status === "KOSONG" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {t.status === "KOSONG" ? "Kosong" : "Terisi"}
            </span>
            {t.orders.length > 0 && (
              <p className="mb-2 text-xs text-gray-400">
                Pesanan: {t.orders.map((o) => o.orderNumber).join(", ")}
              </p>
            )}
            <form action={setTableStatusAction}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="status" value={t.status === "KOSONG" ? "TERISI" : "KOSONG"} />
              <button
                type="submit"
                className="w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Tandai {t.status === "KOSONG" ? "Terisi" : "Kosong"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
