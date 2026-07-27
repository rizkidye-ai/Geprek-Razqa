"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isNotFoundError } from "@/lib/dbErrors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }
  return session.user;
}

export type ExpenseActionResult = { success: true } | { success: false; error: string };

export async function createExpenseAction(input: {
  type: "CAPEX" | "OPEX";
  category: string;
  description: string;
  amount: number;
  frequency: "HARIAN" | "BULANAN";
  date: string;
}): Promise<ExpenseActionResult> {
  const user = await requireAdmin();
  const category = input.category.trim();
  const description = input.description.trim();

  if (!category || Number.isNaN(input.amount) || input.amount <= 0) {
    return { success: false, error: "Kategori dan jumlah wajib diisi dengan benar." };
  }

  await prisma.expense.create({
    data: {
      type: input.type,
      category,
      description: description || null,
      amount: input.amount,
      frequency: input.frequency,
      date: input.date ? new Date(input.date) : new Date(),
      createdById: user.id,
    },
  });

  revalidatePath("/keuangan/pengeluaran");
  revalidatePath("/keuangan/arus-kas");
  revalidatePath("/keuangan/laba-rugi");
  revalidatePath("/keuangan/kelayakan");
  return { success: true };
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.expense.delete({ where: { id } });
  } catch (e) {
    // Sudah terhapus sebelumnya (mis. klik ganda) — abaikan saja, hasil akhirnya sama.
    if (!isNotFoundError(e)) throw e;
  }

  revalidatePath("/keuangan/pengeluaran");
  revalidatePath("/keuangan/arus-kas");
  revalidatePath("/keuangan/laba-rugi");
  revalidatePath("/keuangan/kelayakan");
}
