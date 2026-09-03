import { del, put } from "@vercel/blob";

export const MAX_FEATURE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function sniffImageExtension(bytes: Buffer): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function uploadFeatureImage(
  file: File,
  prefix: string,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return { error: "Only PNG, JPEG, or WebP images are allowed." };
  }
  if (file.size > MAX_FEATURE_IMAGE_BYTES) {
    return { error: "Image must be 5MB or smaller." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImageExtension(bytes);
  if (!ext) {
    return { error: "That file doesn't look like a valid PNG, JPEG, or WebP image." };
  }

  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob = await put(filename, bytes, {
    access: "public",
    contentType: file.type,
  });

  return { url: blob.url };
}

export async function deleteFeatureImageIfBlob(url: string | null | undefined) {
  if (url?.includes(".public.blob.vercel-storage.com/")) {
    await del(url).catch(() => {});
  }
}
