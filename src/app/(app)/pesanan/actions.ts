"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { OrderStatus } from "@prisma/client";

const nextStatus: Record<string, OrderStatus | null> = {
  BARU: "DIPROSES",
  DIPROSES: "SIAP",
  SIAP: "SELESAI",
  SELESAI: null,
  DIBATALKAN: null,
};

async function freeTableIfNoActiveOrders(tableId: string) {
  const activeCount = await prisma.order.count({
    where: { tableId, status: { in: ["BARU", "DIPROSES", "SIAP"] } },
  });
  if (activeCount === 0) {
    await prisma.restaurantTable.update({ where: { id: tableId }, data: { status: "KOSONG" } });
  }
}

export async function advanceOrderStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Tidak diizinkan");

  const id = String(formData.get("id") ?? "");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Pesanan tidak ditemukan.");

  const next = nextStatus[order.status];
  if (!next) throw new Error("Status pesanan tidak bisa dilanjutkan.");

  await prisma.order.update({ where: { id }, data: { status: next } });

  if (next === "SELESAI" && order.tableId) {
    await freeTableIfNoActiveOrders(order.tableId);
  }

  revalidatePath("/pesanan");
  revalidatePath("/meja");
  revalidatePath("/");
}

export async function cancelOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "KASIR"].includes(session.user.role)) {
    throw new Error("Tidak diizinkan");
  }

  const id = String(formData.get("id") ?? "");
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: { include: { ingredients: true } } } } },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.status === "SELESAI" || order.status === "DIBATALKAN") {
    throw new Error("Pesanan ini tidak bisa dibatalkan lagi.");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      for (const mi of item.menuItem.ingredients) {
        const restore = mi.qtyPerPortion * item.qty;
        await tx.ingredient.update({
          where: { id: mi.ingredientId },
          data: { stock: { increment: restore } },
        });
        await tx.stockMovement.create({
          data: {
            ingredientId: mi.ingredientId,
            type: "MASUK",
            qty: restore,
            note: `Pembatalan pesanan ${order.orderNumber}`,
            createdById: session.user.id,
          },
        });
      }
    }

    await tx.payment.deleteMany({ where: { orderId: id } });
    await tx.order.update({ where: { id }, data: { status: "DIBATALKAN" } });
  });

  if (order.tableId) {
    await freeTableIfNoActiveOrders(order.tableId);
  }

  revalidatePath("/pesanan");
  revalidatePath("/meja");
  revalidatePath("/stok");
  revalidatePath("/");
}
