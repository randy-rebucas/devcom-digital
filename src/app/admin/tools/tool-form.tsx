import type { Tool } from "@prisma/client";

const STATUS_OPTIONS: { value: Tool["status"]; label: string }[] = [
  { value: "IN_DEVELOPMENT", label: "In development" },
  { value: "AVAILABLE", label: "Available" },
];

export function ToolForm({
  tool,
  action,
  submitLabel,
}: {
  tool?: Tool;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          defaultValue={tool?.name}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          defaultValue={tool?.slug}
          placeholder="auto-generated from name if left blank"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Feature image URL</label>
        <input
          name="imageUrl"
          defaultValue={tool?.imageUrl ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description (Markdown)</label>
        <textarea
          name="desc"
          defaultValue={tool?.desc}
          required
          rows={6}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Supports Markdown — headings, lists, bold/italic, links.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          name="status"
          defaultValue={tool?.status ?? "IN_DEVELOPMENT"}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Download URL</label>
        <input
          name="downloadUrl"
          defaultValue={tool?.downloadUrl ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Guide URL</label>
        <input
          name="guideUrl"
          defaultValue={tool?.guideUrl ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="requiresLicenseKey"
          name="requiresLicenseKey"
          type="checkbox"
          defaultChecked={tool?.requiresLicenseKey}
          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
        />
        <label htmlFor="requiresLicenseKey" className="text-sm">
          Requires a license key to activate
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={tool?.enabled ?? true}
          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
        />
        <label htmlFor="enabled" className="text-sm">
          Enabled (visible to subscribers)
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}
