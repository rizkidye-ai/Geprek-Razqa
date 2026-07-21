import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";

export default async function StrukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true } },
      payment: true,
      table: true,
      createdBy: true,
    },
  });
  const settings = await prisma.settings.findFirst();

  if (!order) notFound();

  const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-sm">
        <div className="no-print mb-3 flex justify-between">
          <Link href="/kasir" className="text-sm text-gray-500 hover:text-gray-700">
            &larr; Kembali ke Kasir
          </Link>
          <PrintButton />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm font-mono text-sm">
          <div className="mb-4 text-center">
            <p className="text-base font-bold">{settings?.name ?? "Warung Makan Geprek Rzqa"}</p>
            {settings?.address && <p className="text-xs text-gray-500">{settings.address}</p>}
            {settings?.phone && <p className="text-xs text-gray-500">{settings.phone}</p>}
          </div>
          <div className="mb-3 border-y border-dashed border-gray-300 py-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>No. Pesanan</span>
              <span>{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipe</span>
              <span>{order.orderType === "DINE_IN" ? `Dine-in (${order.table?.number ?? "-"})` : "Bawa Pulang"}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{order.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{order.createdBy.name}</span>
            </div>
          </div>

          <div className="mb-3 space-y-1">
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <span>
                    {item.qty}x {item.menuItem.name}
                  </span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
                {item.note && <p className="pl-3 text-xs text-gray-400">*{item.note}</p>}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 pt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
            {order.payment && (
              <>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Metode</span>
                  <span>{order.payment.method}</span>
                </div>
                {order.payment.method === "TUNAI" && order.payment.cashReceived != null && (
                  <>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tunai</span>
                      <span>{formatRupiah(order.payment.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Kembalian</span>
                      <span>{formatRupiah(order.payment.cashReceived - total)}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            {settings?.footer ?? "Terima kasih!"}
          </p>
        </div>
      </div>
    </div>
  );
}
