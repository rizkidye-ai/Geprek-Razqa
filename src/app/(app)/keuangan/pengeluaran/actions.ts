"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }
  return session.user;
}

export async function createExpenseAction(formData: FormData) {
  const user = await requireAdmin();
  const type = String(formData.get("type") ?? "OPEX") as "CAPEX" | "OPEX";
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const dateStr = String(formData.get("date") ?? "");

  if (!category || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Kategori dan jumlah wajib diisi dengan benar.");
  }

  await prisma.expense.create({
    data: {
      type,
      category,
      description: description || null,
      amount,
      date: dateStr ? new Date(dateStr) : new Date(),
      createdById: user.id,
    },
  });

  revalidatePath("/keuangan/pengeluaran");
  revalidatePath("/keuangan/arus-kas");
  revalidatePath("/keuangan/laba-rugi");
  revalidatePath("/keuangan/kelayakan");
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.expense.delete({ where: { id } });

  revalidatePath("/keuangan/pengeluaran");
  revalidatePath("/keuangan/arus-kas");
  revalidatePath("/keuangan/laba-rugi");
  revalidatePath("/keuangan/kelayakan");
}
