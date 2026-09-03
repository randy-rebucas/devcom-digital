import { ImageResponse } from "next/og";
import { logoMarkSvg } from "@/lib/logo";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const svg = `data:image/svg+xml;utf8,${encodeURIComponent(logoMarkSvg())}`;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={svg} width={size.width} height={size.height} alt="" />
    ),
    { ...size },
  );
}
