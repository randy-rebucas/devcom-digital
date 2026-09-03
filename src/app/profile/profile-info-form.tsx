"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ProfileInfoForm({ name, email }: { name: string | null; email: string }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="mt-3 space-y-4">
      <Field label="Name" htmlFor="name" error={state?.error}>
        <Input id="name" name="name" defaultValue={name ?? ""} required />
      </Field>

      <Field label="Email" htmlFor="email" hint="Contact support to change your email.">
        <Input id="email" name="email" value={email} disabled />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state?.success && <p className="text-xs text-gold-bright">{state.success}</p>}
      </div>
    </form>
  );
}
