"use client";

export function ToolDownloadLink({
  slug,
  downloadUrl,
}: {
  slug: string;
  downloadUrl: string;
}) {
  return (
    <a
      href={downloadUrl}
      onClick={() => {
        fetch(`/api/tools/${slug}/download`, { method: "POST" }).catch(() => {});
      }}
      className="mt-3 inline-block rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
    >
      Download tool
    </a>
  );
}
