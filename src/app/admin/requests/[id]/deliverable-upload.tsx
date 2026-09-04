"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { uploadDeliverable, type DeliverableFormState } from "./actions";

type DeliverableItem = { id: string; name: string; fileUrl: string; createdAt: Date };

export function DeliverableUpload({ id, deliverables }: { id: string; deliverables: DeliverableItem[] }) {
  const action = uploadDeliverable.bind(null, id);
  const [state, formAction, pending] = useActionState<DeliverableFormState, FormData>(action, undefined);

  return (
    <section className="border-b border-hairline py-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Deliverables</h2>

      {deliverables.length === 0 ? (
        <p className="mt-3 text-sm text-paper-dim">No files uploaded yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {deliverables.map((file) => (
            <li key={file.id}>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gold underline">
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-6 space-y-3">
        <Field label="Upload a file for the client" htmlFor="file" error={state?.error}>
          <input
            id="file"
            name="file"
            type="file"
            className="mt-1.5 block w-full text-sm text-paper-dim file:mr-3 file:rounded-sm file:border file:border-hairline file:bg-ink file:px-3 file:py-1.5 file:text-sm file:text-paper"
          />
        </Field>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>
    </section>
  );
}
