import { ImageResponse } from "next/og";
import { getStoredLogo } from "@/lib/appIcon";

export const dynamic = "force-dynamic";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await getStoredLogo();
  if (logo) {
    return new Response(new Uint8Array(logo.buffer), {
      headers: { "Content-Type": logo.mime },
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f97316",
          color: "white",
          fontSize: 92,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        GR
      </div>
    ),
    { ...size },
  );
}
