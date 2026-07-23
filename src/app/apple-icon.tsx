import { ImageResponse } from "next/og";
import { getStoredLogo } from "@/lib/appIcon";

export const dynamic = "force-dynamic";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await getStoredLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: logo ? "#ffffff" : "#f97316",
        }}
      >
        {logo ? (
          <img
            src={`data:${logo.mime};base64,${logo.buffer.toString("base64")}`}
            alt=""
            width={size.width}
            height={size.height}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <span
            style={{
              color: "white",
              fontSize: 92,
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            GR
          </span>
        )}
      </div>
    ),
    { ...size },
  );
}
