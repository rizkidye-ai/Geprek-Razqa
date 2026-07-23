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
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan.");

  const next = nextStatus[order.status];
  if (!next) throw new Error("Status pesanan tidak bisa dilanjutkan.");

  if (next === "SELESAI" && !order.payment) {
    throw new Error("Pesanan ini belum dibayar. Gunakan tombol Bayar untuk menyelesaikan pesanan.");
  }

  await prisma.order.update({ where: { id }, data: { status: next } });

  if (next === "SELESAI" && order.tableId) {
    await freeTableIfNoActiveOrders(order.tableId);
  }

  revalidatePath("/pesanan");
  revalidatePath("/meja");
  revalidatePath("/");
}

export type PayOrderPayload = {
  orderId: string;
  method: "TUNAI" | "QRIS" | "TRANSFER";
  cashReceived?: number;
};

export async function payOrderAction(payload: PayOrderPayload) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "KASIR"].includes(session.user.role)) {
    throw new Error("Tidak diizinkan");
  }

  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: { items: true, payment: true },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.payment) throw new Error("Pesanan ini sudah dibayar.");
  if (order.status === "DIBATALKAN") throw new Error("Pesanan ini sudah dibatalkan.");

  const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (payload.method === "TUNAI" && (!payload.cashReceived || payload.cashReceived < total)) {
    throw new Error("Uang tunai kurang dari total belanja.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        orderId: order.id,
        method: payload.method,
        amount: total,
        cashReceived: payload.method === "TUNAI" ? payload.cashReceived : null,
        cashierId: session.user.id,
      },
    });
    if (order.status !== "SELESAI") {
      await tx.order.update({ where: { id: order.id }, data: { status: "SELESAI" } });
    }
  });

  if (order.tableId) {
    await freeTableIfNoActiveOrders(order.tableId);
  }

  revalidatePath("/pesanan");
  revalidatePath("/meja");
  revalidatePath("/laporan");
  revalidatePath("/");

  return { orderId: order.id };
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
  if (order.status === "DIBATALKAN") {
    throw new Error("Pesanan ini sudah dibatalkan.");
  }
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (order.status === "SELESAI" && order.createdAt < todayStart) {
    throw new Error("Pesanan selesai dari hari sebelumnya tidak bisa dibatalkan lagi.");
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
