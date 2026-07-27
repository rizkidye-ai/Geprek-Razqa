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
  return session.user;
}

export async function createIngredientAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const stock = parseFloat(String(formData.get("stock") ?? "0"));
  const minStock = parseFloat(String(formData.get("minStock") ?? "0"));
  const costPerUnit = parseFloat(String(formData.get("costPerUnit") ?? "0"));

  if (!name || !unit) throw new Error("Nama dan satuan wajib diisi.");

  await prisma.ingredient.create({
    data: {
      name,
      unit,
      stock: Number.isNaN(stock) ? 0 : stock,
      minStock: Number.isNaN(minStock) ? 0 : minStock,
      costPerUnit: Number.isNaN(costPerUnit) ? 0 : costPerUnit,
    },
  });
  revalidatePath("/stok");
  revalidatePath("/keuangan/hpp");
}

export async function updateIngredientAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const minStock = parseFloat(String(formData.get("minStock") ?? "0"));
  const costPerUnit = parseFloat(String(formData.get("costPerUnit") ?? "0"));
  await prisma.ingredient.update({
    where: { id },
    data: {
      minStock: Number.isNaN(minStock) ? 0 : minStock,
      costPerUnit: Number.isNaN(costPerUnit) ? 0 : costPerUnit,
    },
  });
  revalidatePath("/stok");
  revalidatePath("/keuangan/hpp");
}

export async function deleteIngredientAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const usedInRecipe = await prisma.menuIngredient.count({ where: { ingredientId: id } });
  if (usedInRecipe > 0) {
    throw new Error("Bahan ini masih dipakai di resep menu.");
  }
  await prisma.stockMovement.deleteMany({ where: { ingredientId: id } });
  try {
    await prisma.ingredient.delete({ where: { id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/stok");
}

export type StockMovementResult = { success: true } | { success: false; error: string };

export async function recordStockMovementAction(formData: FormData): Promise<StockMovementResult> {
  const user = await requireStaff();
  const ingredientId = String(formData.get("ingredientId") ?? "");
  const type = String(formData.get("type") ?? "MASUK") as "MASUK" | "KELUAR";
  const qty = parseFloat(String(formData.get("qty") ?? "0"));
  const note = String(formData.get("note") ?? "").trim();

  if (!ingredientId || Number.isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah tidak valid." };
  }

  const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
  if (!ingredient) return { success: false, error: "Bahan tidak ditemukan." };

  const delta = type === "MASUK" ? qty : -qty;
  if (ingredient.stock + delta < 0) {
    return {
      success: false,
      error: `Stok ${ingredient.name} cuma ${ingredient.stock} ${ingredient.unit}, tidak mencukupi untuk pengurangan ini.`,
    };
  }

  await prisma.$transaction([
    prisma.ingredient.update({
      where: { id: ingredientId },
      data: { stock: { increment: delta } },
    }),
    prisma.stockMovement.create({
      data: {
        ingredientId,
        type,
        qty,
        note: note || null,
        createdById: user.id,
      },
    }),
  ]);

  revalidatePath("/stok");
  return { success: true };
}
