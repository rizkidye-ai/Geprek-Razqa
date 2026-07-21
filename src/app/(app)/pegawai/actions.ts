"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }
  return session.user;
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "KASIR") as "ADMIN" | "KASIR" | "DAPUR";

  if (!name || !username || password.length < 6) {
    throw new Error("Data tidak lengkap. Password minimal 6 karakter.");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username sudah digunakan.");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, username, passwordHash, role },
  });

  revalidatePath("/pegawai");
}

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) throw new Error("Tidak bisa menonaktifkan akun sendiri.");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  revalidatePath("/pegawai");
}

export async function resetPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) throw new Error("Password minimal 6 karakter.");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/pegawai");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) throw new Error("Tidak bisa menghapus akun sendiri.");

  const usedInOrders = await prisma.order.count({ where: { createdById: id } });
  const usedInPayments = await prisma.payment.count({ where: { cashierId: id } });
  if (usedInOrders > 0 || usedInPayments > 0) {
    throw new Error("Pegawai ini memiliki riwayat transaksi, nonaktifkan saja alih-alih menghapus.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/pegawai");
}
