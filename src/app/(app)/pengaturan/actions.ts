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
  const removeLogo = formData.get("removeLogo") === "on";
  const logoFile = formData.get("logo");

  const existing = await prisma.settings.findFirst();
  let logoUrl = existing?.logoUrl ?? null;

  if (removeLogo) {
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      throw new Error("File logo harus berupa gambar.");
    }
    if (logoFile.size > 1_000_000) {
      throw new Error("Ukuran logo maksimal 1MB.");
    }
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    logoUrl = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
  }

  if (existing) {
    await prisma.settings.update({
      where: { id: existing.id },
      data: { name, address, phone, footer, logoUrl },
    });
  } else {
    await prisma.settings.create({ data: { name, address, phone, footer, logoUrl } });
  }

  revalidatePath("/pengaturan");
  revalidatePath("/struk");
}
