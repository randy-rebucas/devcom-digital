"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadAvatar, type ProfileFormState } from "./actions";
import { Button } from "@/components/ui/button";

export function AvatarForm({ image, name }: { image: string | null; name: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    uploadAvatar,
    undefined,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const initials = (name ?? "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  return (
    <form action={formAction} className="mt-3 flex items-center gap-5">
      {preview || image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview ?? image ?? undefined}
          alt="Your avatar"
          className="h-16 w-16 shrink-0 rounded-sm border border-hairline object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-hairline bg-ink-raised font-display text-xl text-paper-dim">
          {initials}
        </div>
      )}

      <div>
        <input
          id="avatar"
          name="avatar"
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
        <p className="mt-1.5 text-xs text-paper-dim">PNG, JPEG, or WebP. Max 2MB.</p>
        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
          {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
          {state?.success && <p className="text-xs text-gold-bright">{state.success}</p>}
        </div>
      </div>
    </form>
  );
}
