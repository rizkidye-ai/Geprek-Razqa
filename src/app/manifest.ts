import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await prisma.settings.findFirst({ select: { name: true } });
  const name = settings?.name || "Warung Makan Geprek Rzqa";

  return {
    name,
    short_name: "Geprek Rzqa",
    description: "Aplikasi kasir & manajemen warung makan.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
