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

export type DailyClosingResult = { success: true } | { success: false; error: string };

export async function recordDailyClosingAction(formData: FormData): Promise<DailyClosingResult> {
  const user = await requireAdmin();

  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? new Date(dateStr) : new Date();

  const kasToko = parseInt(String(formData.get("kasToko") ?? "0"), 10) || 0;
  const uangGas = parseInt(String(formData.get("uangGas") ?? "0"), 10) || 0;
  const listrik = parseInt(String(formData.get("listrik") ?? "0"), 10) || 0;
  const gajiKaryawan = parseInt(String(formData.get("gajiKaryawan") ?? "0"), 10) || 0;

  if ([kasToko, uangGas, listrik, gajiKaryawan].some((v) => v < 0)) {
    return { success: false, error: "Jumlah tidak boleh negatif." };
  }
  if (kasToko <= 0 && uangGas <= 0 && listrik <= 0 && gajiKaryawan <= 0) {
    return { success: false, error: "Isi minimal salah satu jumlah." };
  }

  await prisma.$transaction(async (tx) => {
    if (kasToko > 0) {
      await tx.cashReserve.create({
        data: { amount: kasToko, date, note: "Tutup kasir harian", createdById: user.id },
      });
    }

    const expenseRows: {
      type: "OPEX";
      category: string;
      description: string;
      amount: number;
      date: Date;
      createdById: string;
    }[] = [];
    if (uangGas > 0) {
      expenseRows.push({
        type: "OPEX",
        category: "Gas LPG",
        description: "Tutup kasir harian",
        amount: uangGas,
        date,
        createdById: user.id,
      });
    }
    if (listrik > 0) {
      expenseRows.push({
        type: "OPEX",
        category: "Listrik & Air",
        description: "Tutup kasir harian",
        amount: listrik,
        date,
        createdById: user.id,
      });
    }
    if (gajiKaryawan > 0) {
      expenseRows.push({
        type: "OPEX",
        category: "Gaji Karyawan",
        description: "Tutup kasir harian",
        amount: gajiKaryawan,
        date,
        createdById: user.id,
      });
    }
    if (expenseRows.length > 0) {
      await tx.expense.createMany({ data: expenseRows });
    }
  });

  revalidatePath("/keuangan/tutup-kasir");
  revalidatePath("/keuangan/pengeluaran");
  revalidatePath("/keuangan/arus-kas");
  revalidatePath("/keuangan/laba-rugi");
  revalidatePath("/keuangan/kelayakan");

  return { success: true };
}

export async function deleteCashReserveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.cashReserve.delete({ where: { id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/keuangan/tutup-kasir");
}
