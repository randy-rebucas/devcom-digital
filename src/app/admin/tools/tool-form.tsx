"use client";

import { useActionState } from "react";
import type { Tool } from "@prisma/client";
import type { ToolFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

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
  action: (prevState: ToolFormState, formData: FormData) => Promise<ToolFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Field label="Name" htmlFor="name" error={state?.error}>
        <Input id="name" name="name" defaultValue={tool?.name} required />
      </Field>

      <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
        <Input id="slug" name="slug" defaultValue={tool?.slug} placeholder="my-tool" />
      </Field>

      <Field label="Feature image URL" htmlFor="imageUrl">
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={tool?.imageUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <Field
        label="Description (Markdown)"
        htmlFor="desc"
        hint="Supports Markdown — headings, lists, bold/italic, links."
      >
        <Textarea
          id="desc"
          name="desc"
          defaultValue={tool?.desc}
          required
          rows={6}
          className="font-mono"
        />
      </Field>

      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={tool?.status ?? "IN_DEVELOPMENT"}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Download URL" htmlFor="downloadUrl">
        <Input
          id="downloadUrl"
          name="downloadUrl"
          defaultValue={tool?.downloadUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <Field label="Guide URL" htmlFor="guideUrl">
        <Input
          id="guideUrl"
          name="guideUrl"
          defaultValue={tool?.guideUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          id="requiresLicenseKey"
          name="requiresLicenseKey"
          type="checkbox"
          defaultChecked={tool?.requiresLicenseKey}
          className="h-4 w-4 rounded-sm border-hairline bg-ink text-gold focus-visible:outline-2 focus-visible:outline-gold-bright"
        />
        <label htmlFor="requiresLicenseKey" className="text-sm text-paper-dim">
          Requires a license key to activate
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={tool?.enabled ?? true}
          className="h-4 w-4 rounded-sm border-hairline bg-ink text-gold focus-visible:outline-2 focus-visible:outline-gold-bright"
        />
        <label htmlFor="enabled" className="text-sm text-paper-dim">
          Enabled (visible to subscribers)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
