import { ImageResponse } from "next/og";
import { logoMarkSvg } from "@/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const svg = `data:image/svg+xml;utf8,${encodeURIComponent(logoMarkSvg())}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#15120e",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svg} width={140} height={140} alt="" />
      </div>
    ),
    { ...size },
  );
}
