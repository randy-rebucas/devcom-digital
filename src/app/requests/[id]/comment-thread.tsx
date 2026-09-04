"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { postComment, type CommentFormState } from "./comment-actions";

type CommentItem = {
  id: string;
  body: string;
  authorType: "MEMBER" | "ADMIN" | "SYSTEM";
  createdAt: Date;
  author: { name: string | null } | null;
};

const AUTHOR_LABEL: Record<CommentItem["authorType"], string> = {
  MEMBER: "You",
  ADMIN: "Devcom Digital",
  SYSTEM: "System",
};

export function CommentThread({ id, comments }: { id: string; comments: CommentItem[] }) {
  const action = postComment.bind(null, id);
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(action, undefined);

  return (
    <section className="border-b border-hairline py-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
        Messages
      </h2>

      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-paper-dim">No messages yet.</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <p className="text-xs font-semibold text-paper-dim">
                {comment.authorType === "MEMBER" ? comment.author?.name ?? "You" : AUTHOR_LABEL[comment.authorType]}
                <span className="ml-2 font-normal">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-paper">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-6 space-y-3">
        <Field label="Send a message" htmlFor="body" error={state?.error}>
          <Textarea id="body" name="body" rows={3} placeholder="Ask a question or share an update…" />
        </Field>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </form>
    </section>
  );
}
