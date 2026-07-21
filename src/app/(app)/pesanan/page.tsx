import Link from "next/link";
import { Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { advanceOrderStatusAction, cancelOrderAction } from "./actions";
import { auth } from "@/auth";

const columns: { status: "BARU" | "DIPROSES" | "SIAP" | "SELESAI"; label: string; color: string }[] = [
  { status: "BARU", label: "Baru", color: "border-blue-400" },
  { status: "DIPROSES", label: "Diproses", color: "border-yellow-400" },
  { status: "SIAP", label: "Siap Disajikan", color: "border-purple-400" },
  { status: "SELESAI", label: "Selesai Hari Ini", color: "border-green-400" },
];

const nextLabel: Record<string, string> = {
  BARU: "Mulai Proses",
  DIPROSES: "Tandai Siap",
  SIAP: "Selesaikan",
};

export default async function PesananPage() {
  const session = await auth();
  const role = session?.user.role ?? "";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: { in: ["BARU", "DIPROSES", "SIAP"] } },
        { status: "SELESAI", createdAt: { gte: todayStart } },
      ],
    },
    include: {
      items: { include: { menuItem: true } },
      table: true,
      payment: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const grouped = {
    BARU: orders.filter((o) => o.status === "BARU"),
    DIPROSES: orders.filter((o) => o.status === "DIPROSES"),
    SIAP: orders.filter((o) => o.status === "SIAP"),
    SELESAI: orders.filter((o) => o.status === "SELESAI"),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pesanan & Dapur</h1>
        <p className="text-sm text-gray-500">Kelola alur pesanan dari dapur hingga selesai disajikan</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.status} className={`rounded-xl border-t-4 ${col.color} bg-white p-3 shadow-sm`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">{col.label}</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {grouped[col.status].length}
              </span>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {grouped[col.status].map((order) => (
                <div key={order.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <p className="mb-1 text-xs text-gray-500">
                    {order.orderType === "DINE_IN" ? order.table?.number ?? "Dine-in" : "Bawa Pulang"}
                    {order.customerName ? ` · ${order.customerName}` : ""}
                  </p>
                  <ul className="mb-2 space-y-0.5 text-xs text-gray-700">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.qty}x {item.menuItem.name}
                        {item.note && <span className="text-gray-400"> ({item.note})</span>}
                      </li>
                    ))}
                  </ul>
                  {order.payment && (
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      {formatRupiah(order.payment.amount)} · {order.payment.method}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {nextLabel[order.status] && (
                      <form action={advanceOrderStatusAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600"
                        >
                          {nextLabel[order.status]}
                        </button>
                      </form>
                    )}
                    {["ADMIN", "KASIR"].includes(role) && order.status !== "SELESAI" && (
                      <form action={cancelOrderAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                      </form>
                    )}
                    {["ADMIN", "KASIR"].includes(role) && (
                      <Link
                        href={`/struk/${order.id}`}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Printer size={12} /> Struk
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {grouped[col.status].length === 0 && (
                <p className="py-6 text-center text-xs text-gray-400">Tidak ada pesanan</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
