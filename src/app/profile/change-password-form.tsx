"use client";

import { useActionState } from "react";
import { changePassword, type ProfileFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    changePassword,
    undefined,
  );

  return (
    <form action={formAction} className="mt-3 space-y-4">
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}

      <Field label="Current password" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </Field>

      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          minLength={8}
          required
        />
      </Field>

      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </Button>
        {state?.success && <p className="text-xs text-gold-bright">{state.success}</p>}
      </div>
    </form>
  );
}
