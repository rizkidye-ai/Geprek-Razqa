"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateOrderNumber } from "@/lib/orders";

export type CartItem = {
  menuItemId: string;
  qty: number;
  note?: string;
};

export type CreateOrderPayload = {
  orderType: "DINE_IN" | "TAKEAWAY";
  tableId?: string;
  customerName?: string;
  note?: string;
  items: CartItem[];
  paymentMethod?: "TUNAI" | "QRIS" | "TRANSFER";
  cashReceived?: number;
};

export type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

export async function createOrderAction(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user || !["ADMIN", "KASIR"].includes(session.user.role)) {
    throw new Error("Tidak diizinkan");
  }

  if (payload.items.length === 0) {
    return { success: false, error: "Keranjang masih kosong." };
  }
  if (payload.orderType === "DINE_IN" && !payload.tableId) {
    return { success: false, error: "Pilih meja untuk pesanan dine-in." };
  }
  if (payload.orderType === "TAKEAWAY" && !payload.paymentMethod) {
    return { success: false, error: "Pesanan bawa pulang harus dibayar di muka." };
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: payload.items.map((i) => i.menuItemId) } },
    include: { ingredients: true },
  });
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  let total = 0;
  const orderItemsData: { menuItemId: string; qty: number; price: number; note: string | null }[] = [];
  for (const cartItem of payload.items) {
    const menuItem = menuMap.get(cartItem.menuItemId);
    if (!menuItem || !menuItem.isActive) {
      return { success: false, error: `Menu tidak tersedia: ${cartItem.menuItemId}` };
    }
    total += menuItem.price * cartItem.qty;
    orderItemsData.push({
      menuItemId: menuItem.id,
      qty: cartItem.qty,
      price: menuItem.price,
      note: cartItem.note || null,
    });
  }

  if (payload.paymentMethod === "TUNAI") {
    if (!payload.cashReceived || payload.cashReceived < total) {
      return { success: false, error: "Uang tunai yang diterima kurang dari total belanja." };
    }
  }

  // Aggregate ingredient consumption and validate stock availability
  const consumption = new Map<string, number>();
  for (const cartItem of payload.items) {
    const menuItem = menuMap.get(cartItem.menuItemId)!;
    for (const mi of menuItem.ingredients) {
      const need = mi.qtyPerPortion * cartItem.qty;
      consumption.set(mi.ingredientId, (consumption.get(mi.ingredientId) ?? 0) + need);
    }
  }

  if (consumption.size > 0) {
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: Array.from(consumption.keys()) } },
    });
    const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
    for (const [ingredientId, needed] of consumption.entries()) {
      const ingredient = ingredientMap.get(ingredientId);
      if (!ingredient || ingredient.stock < needed) {
        return {
          success: false,
          error: `Stok ${ingredient?.name ?? "bahan"} tidak mencukupi untuk pesanan ini.`,
        };
      }
    }
  }

  const orderNumber = await generateOrderNumber();
  const settings = await prisma.settings.findFirst();
  const initialStatus = settings?.kitchenModeEnabled === false ? "SELESAI" : "BARU";

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        orderType: payload.orderType,
        tableId: payload.orderType === "DINE_IN" ? payload.tableId : null,
        customerName: payload.customerName || null,
        note: payload.note || null,
        status: initialStatus,
        createdById: session.user.id,
        items: { create: orderItemsData },
        ...(payload.paymentMethod
          ? {
              payment: {
                create: {
                  method: payload.paymentMethod,
                  amount: total,
                  cashReceived: payload.paymentMethod === "TUNAI" ? payload.cashReceived : null,
                  cashierId: session.user.id,
                },
              },
            }
          : {}),
      },
    });

    for (const [ingredientId, qty] of consumption.entries()) {
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: { stock: { decrement: qty } },
      });
      await tx.stockMovement.create({
        data: {
          ingredientId,
          type: "KELUAR",
          qty,
          note: `Pesanan ${orderNumber}`,
          createdById: session.user.id,
        },
      });
    }

    if (payload.orderType === "DINE_IN" && payload.tableId) {
      await tx.restaurantTable.update({
        where: { id: payload.tableId },
        data: { status: "TERISI" },
      });
    }

    return created;
  });

  revalidatePath("/pesanan");
  revalidatePath("/meja");
  revalidatePath("/stok");
  revalidatePath("/");

  return { success: true, orderId: order.id, orderNumber: order.orderNumber };
}
