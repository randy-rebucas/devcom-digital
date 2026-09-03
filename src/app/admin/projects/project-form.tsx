"use client";

import { useActionState } from "react";
import type { Project } from "@prisma/client";
import type { ProjectFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const STATUS_OPTIONS: { value: Project["status"]; label: string }[] = [
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export function ProjectForm({
  project,
  action,
  submitLabel,
}: {
  project?: Project;
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Field label="Name" htmlFor="name" error={state?.error}>
        <Input id="name" name="name" defaultValue={project?.name} required />
      </Field>

      <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
        <Input id="slug" name="slug" defaultValue={project?.slug} placeholder="my-project" />
      </Field>

      <Field label="Feature image URL" htmlFor="imageUrl">
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={project?.imageUrl ?? ""}
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
          defaultValue={project?.desc}
          required
          rows={6}
          className="font-mono"
        />
      </Field>

      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={project?.status ?? "IN_PROGRESS"}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Live URL" htmlFor="liveUrl">
        <Input
          id="liveUrl"
          name="liveUrl"
          defaultValue={project?.liveUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <Field label="Repository URL" htmlFor="repoUrl">
        <Input
          id="repoUrl"
          name="repoUrl"
          defaultValue={project?.repoUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={project?.enabled ?? true}
          className="h-4 w-4 rounded-sm border-hairline bg-ink text-gold focus-visible:outline-2 focus-visible:outline-gold-bright"
        />
        <label htmlFor="enabled" className="text-sm text-paper-dim">
          Enabled (visible on the public site)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
