"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isNotFoundError } from "@/lib/dbErrors";

export type UserRole = "ADMIN" | "KASIR" | "DAPUR";
export type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }
  return session.user;
}

export async function createUserAction(input: {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}): Promise<ActionResult> {
  await requireAdmin();
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const password = input.password;

  if (!name || !username || password.length < 6) {
    return { success: false, error: "Data tidak lengkap. Password minimal 6 karakter." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { success: false, error: "Username sudah digunakan." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, username, passwordHash, role: input.role },
  });

  revalidatePath("/pegawai");
  return { success: true };
}

export async function updateUserAction(input: {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = input.id;
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();

  if (!name || !username) {
    return { success: false, error: "Nama dan username wajib diisi." };
  }
  if (id === admin.id && input.role !== "ADMIN") {
    return { success: false, error: "Tidak bisa mengubah peran akun sendiri." };
  }

  const existing = await prisma.user.findFirst({ where: { username, NOT: { id } } });
  if (existing) return { success: false, error: "Username sudah dipakai akun lain." };

  await prisma.user.update({
    where: { id },
    data: { name, username, role: input.role },
  });

  revalidatePath("/pegawai");
  return { success: true };
}

export async function toggleUserActiveAction(input: { id: string }): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (input.id === admin.id) {
    return { success: false, error: "Tidak bisa menonaktifkan akun sendiri." };
  }

  const user = await prisma.user.findUnique({ where: { id: input.id } });
  if (!user) return { success: false, error: "Pegawai tidak ditemukan." };

  await prisma.user.update({ where: { id: input.id }, data: { isActive: !user.isActive } });
  revalidatePath("/pegawai");
  return { success: true };
}

export async function resetPasswordAction(input: {
  id: string;
  password: string;
}): Promise<ActionResult> {
  await requireAdmin();
  if (input.password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  await prisma.user.update({ where: { id: input.id }, data: { passwordHash } });
  revalidatePath("/pegawai");
  return { success: true };
}

export async function deleteUserAction(input: { id: string }): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (input.id === admin.id) {
    return { success: false, error: "Tidak bisa menghapus akun sendiri." };
  }

  const usedInOrders = await prisma.order.count({ where: { createdById: input.id } });
  const usedInPayments = await prisma.payment.count({ where: { cashierId: input.id } });
  if (usedInOrders > 0 || usedInPayments > 0) {
    return {
      success: false,
      error: "Pegawai ini memiliki riwayat transaksi, nonaktifkan saja alih-alih menghapus.",
    };
  }

  try {
    await prisma.user.delete({ where: { id: input.id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/pegawai");
  return { success: true };
}
