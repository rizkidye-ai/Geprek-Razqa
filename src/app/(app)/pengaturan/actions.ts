"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Tidak diizinkan");
  }

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const footer = String(formData.get("footer") ?? "").trim();

  const existing = await prisma.settings.findFirst();
  if (existing) {
    await prisma.settings.update({
      where: { id: existing.id },
      data: { name, address, phone, footer },
    });
  } else {
    await prisma.settings.create({ data: { name, address, phone, footer } });
  }

  revalidatePath("/pengaturan");
  revalidatePath("/struk");
}
