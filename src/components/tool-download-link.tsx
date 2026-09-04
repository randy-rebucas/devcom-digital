export function ToolDownloadLink({ slug }: { slug: string }) {
  return (
    <a
      href={`/api/tools/${slug}/download`}
      className="mt-3 inline-block rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
    >
      Download tool
    </a>
  );
}
