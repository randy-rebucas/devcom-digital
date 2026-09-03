import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { logoMarkSvg } from "@/lib/logo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mark = `data:image/svg+xml;utf8,${encodeURIComponent(logoMarkSvg())}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#15120e",
          color: "#f2ece1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={44} height={44} alt="" />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            DEVCOM<span style={{ color: "#c9973f" }}>DIGITAL</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          Every marketing tool. One credential.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            color: "#a89e8c",
            maxWidth: 820,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size },
  );
}
