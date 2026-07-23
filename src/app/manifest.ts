import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getStoredLogo } from "@/lib/appIcon";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [settings, logo] = await Promise.all([
    prisma.settings.findFirst({ select: { name: true } }),
    getStoredLogo(),
  ]);
  const name = settings?.name || "Warung Makan Geprek Rzqa";
  const iconType = logo?.mime ?? "image/png";

  return {
    name,
    short_name: "Geprek Rzqa",
    description: "Aplikasi kasir & manajemen warung makan.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      { src: "/icon", sizes: "512x512", type: iconType, purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: iconType },
    ],
  };
}
