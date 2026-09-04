"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
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
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Field label="Name" htmlFor="name" error={state?.error}>
        <Input id="name" name="name" defaultValue={project?.name} required />
      </Field>

      <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
        <Input id="slug" name="slug" defaultValue={project?.slug} placeholder="my-project" />
      </Field>

      <Field label="Tagline" htmlFor="tagline" hint="A short one-liner shown on project cards.">
        <Input
          id="tagline"
          name="tagline"
          defaultValue={project?.tagline ?? ""}
          placeholder="A tool that does X for Y"
        />
      </Field>

      <Field label="Feature image URL" htmlFor="imageUrl" hint="Or upload an image below to override this.">
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={project?.imageUrl ?? ""}
          placeholder="https://..."
        />
      </Field>

      <Field label="Upload feature image" htmlFor="imageFile" hint="PNG, JPEG, or WebP. Max 5MB.">
        <div className="flex items-center gap-4">
          {(preview ?? project?.imageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview ?? project?.imageUrl ?? undefined}
              alt="Feature image preview"
              className="h-16 w-16 shrink-0 rounded-sm border border-hairline object-cover"
            />
          )}
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (previewRef.current) URL.revokeObjectURL(previewRef.current);
              const file = e.target.files?.[0];
              const nextPreview = file ? URL.createObjectURL(file) : null;
              previewRef.current = nextPreview;
              setPreview(nextPreview);
            }}
            className="block text-xs text-paper-dim file:mr-3 file:rounded-sm file:border file:border-hairline file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-paper file:transition-colors hover:file:border-gold hover:file:text-gold-bright"
          />
        </div>
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

      <Field
        label="Screenshot URLs"
        htmlFor="screenshotUrls"
        hint="One image URL per line. Removing a line removes that screenshot."
      >
        <Textarea
          id="screenshotUrls"
          name="screenshotUrls"
          defaultValue={project?.screenshots?.join("\n") ?? ""}
          rows={4}
          className="font-mono"
          placeholder="https://..."
        />
      </Field>

      <Field
        label="Upload screenshots"
        htmlFor="screenshotFiles"
        hint="PNG, JPEG, or WebP. Max 5MB each. Appended to the URLs above."
      >
        <input
          id="screenshotFiles"
          name="screenshotFiles"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="block text-xs text-paper-dim file:mr-3 file:rounded-sm file:border file:border-hairline file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-paper file:transition-colors hover:file:border-gold hover:file:text-gold-bright"
        />
        {project?.screenshots && project.screenshots.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.screenshots.map((url) => (
              <Image
                key={url}
                src={url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-sm border border-hairline object-cover"
              />
            ))}
          </div>
        )}
      </Field>

      <Field label="Tech stack / tags" htmlFor="tags" hint="Comma-separated, e.g. Next.js, PostgreSQL, Stripe">
        <Input
          id="tags"
          name="tags"
          defaultValue={project?.tags?.join(", ") ?? ""}
          placeholder="Next.js, PostgreSQL, Stripe"
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

      <div className="flex items-center gap-2">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          defaultChecked={project?.featured ?? false}
          className="h-4 w-4 rounded-sm border-hairline bg-ink text-gold focus-visible:outline-2 focus-visible:outline-gold-bright"
        />
        <label htmlFor="featured" className="text-sm text-paper-dim">
          Featured (highlighted at the top of the showcase)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
