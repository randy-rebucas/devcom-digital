"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { regenerateQuote, type QuoteRequestFormState } from "../actions";

export function RegenerateForm({ id }: { id: string }) {
  const action = regenerateQuote.bind(null, id);
  const [state, formAction, pending] = useActionState<QuoteRequestFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-3 border-t border-hairline pt-6">
      <Field
        label="Request a revised quote"
        htmlFor="additionalNotes"
        hint="Add notes on what should change and the AI will draft a new quotation."
        error={state?.error}
      >
        <Textarea id="additionalNotes" name="additionalNotes" rows={3} placeholder="e.g. lower budget, tighter timeline, drop the mobile app…" />
      </Field>
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Regenerating…" : "Regenerate quote"}
      </Button>
    </form>
  );
}
