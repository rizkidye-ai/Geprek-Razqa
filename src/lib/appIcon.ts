import { prisma } from "@/lib/prisma";

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

export async function getStoredLogo(): Promise<{ buffer: Buffer; mime: string } | null> {
  const settings = await prisma.settings.findFirst({ select: { logoUrl: true } });
  if (!settings?.logoUrl) return null;

  const match = DATA_URL_RE.exec(settings.logoUrl);
  if (!match) return null;

  return { buffer: Buffer.from(match[2], "base64"), mime: match[1] };
}
