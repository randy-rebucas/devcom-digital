"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { addAdminNote, type NoteFormState } from "./actions";

type NoteItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string | null } | null;
};

export function NotesPanel({ id, notes }: { id: string; notes: NoteItem[] }) {
  const action = addAdminNote.bind(null, id);
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(action, undefined);

  return (
    <section className="border-b border-hairline py-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
        Internal notes
      </h2>
      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-paper-dim">No notes yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="text-sm">
              <p className="text-xs font-semibold text-paper-dim">
                {note.author?.name ?? "Admin"}
                <span className="ml-2 font-normal">{new Date(note.createdAt).toLocaleString()}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-paper">{note.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-6 space-y-3">
        <Field label="Add a note (internal only)" htmlFor="body" error={state?.error}>
          <Textarea id="body" name="body" rows={3} placeholder="Notes visible only to admins…" />
        </Field>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
        </Button>
      </form>
    </section>
  );
}
