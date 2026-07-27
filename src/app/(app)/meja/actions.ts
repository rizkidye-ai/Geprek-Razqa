"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isNotFoundError } from "@/lib/dbErrors";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "KASIR"].includes(session.user.role)) {
    throw new Error("Tidak diizinkan");
  }
}

export async function createTableAction(formData: FormData) {
  await requireStaff();
  const number = String(formData.get("number") ?? "").trim();
  const capacity = parseInt(String(formData.get("capacity") ?? "4"), 10);
  if (!number) return;
  await prisma.restaurantTable.create({
    data: { number, capacity: Number.isNaN(capacity) ? 4 : capacity },
  });
  revalidatePath("/meja");
}

export async function deleteTableAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const activeOrders = await prisma.order.count({
    where: { tableId: id, status: { in: ["BARU", "DIPROSES", "SIAP"] } },
  });
  if (activeOrders > 0) {
    throw new Error("Meja masih memiliki pesanan aktif.");
  }
  try {
    await prisma.restaurantTable.delete({ where: { id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/meja");
}

export async function setTableStatusAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "KOSONG") as "KOSONG" | "TERISI";
  await prisma.restaurantTable.update({ where: { id }, data: { status } });
  revalidatePath("/meja");
  revalidatePath("/kasir");
}
