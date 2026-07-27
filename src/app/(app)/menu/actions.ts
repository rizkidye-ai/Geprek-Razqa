"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isNotFoundError } from "@/lib/dbErrors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }
}

function parseRecipe(formData: FormData) {
  const ingredientIds = formData.getAll("ingredientId") as string[];
  const qtys = formData.getAll("qtyPerPortion") as string[];
  const recipe: { ingredientId: string; qtyPerPortion: number }[] = [];
  ingredientIds.forEach((id, idx) => {
    const qty = parseFloat(qtys[idx]);
    if (id && !Number.isNaN(qty) && qty > 0) {
      recipe.push({ ingredientId: id, qtyPerPortion: qty });
    }
  });
  return recipe;
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.category.create({ data: { name } });
  revalidatePath("/menu");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Kategori masih memiliki menu, pindahkan atau hapus menu terlebih dahulu.");
  }
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/menu");
}

export async function createMenuItemAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? "0"), 10);
  const categoryId = String(formData.get("categoryId") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const recipe = parseRecipe(formData);

  if (!name || !categoryId || Number.isNaN(price) || price <= 0) {
    throw new Error("Data menu tidak lengkap.");
  }

  await prisma.menuItem.create({
    data: {
      name,
      description: description || null,
      price,
      categoryId,
      imageUrl: imageUrl || null,
      ingredients: {
        create: recipe,
      },
    },
  });

  revalidatePath("/menu");
  redirect("/menu");
}

export async function updateMenuItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? "0"), 10);
  const categoryId = String(formData.get("categoryId") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const recipe = parseRecipe(formData);

  if (!id || !name || !categoryId || Number.isNaN(price) || price <= 0) {
    throw new Error("Data menu tidak lengkap.");
  }

  await prisma.$transaction([
    prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        imageUrl: imageUrl || null,
      },
    }),
    prisma.menuIngredient.deleteMany({ where: { menuItemId: id } }),
    ...(recipe.length > 0
      ? [
          prisma.menuIngredient.createMany({
            data: recipe.map((r) => ({ ...r, menuItemId: id })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/menu");
  redirect("/menu");
}

export async function toggleMenuItemActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.menuItem.update({ where: { id }, data: { isActive: !item.isActive } });
  revalidatePath("/menu");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const usedInOrders = await prisma.orderItem.count({ where: { menuItemId: id } });
  if (usedInOrders > 0) {
    throw new Error("Menu ini sudah pernah dipesan, nonaktifkan saja alih-alih menghapus.");
  }
  await prisma.menuIngredient.deleteMany({ where: { menuItemId: id } });
  try {
    await prisma.menuItem.delete({ where: { id } });
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  revalidatePath("/menu");
}
