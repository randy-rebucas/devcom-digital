"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createToolApiKeyAction, revokeToolApiKeyAction } from "../actions";

type ApiKeyRow = {
  id: string;
  name: string | null;
  keyPrefix: string;
  active: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export function ApiKeysPanel({ toolId, keys }: { toolId: string; keys: ApiKeyRow[] }) {
  const [pending, startTransition] = useTransition();
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  function handleCreate() {
    startTransition(async () => {
      const rawKey = await createToolApiKeyAction(toolId);
      setRevealedKey(rawKey);
    });
  }

  function handleRevoke(keyId: string) {
    startTransition(async () => {
      await revokeToolApiKeyAction(toolId, keyId);
    });
  }

  return (
    <div className="mt-10 border-t border-hairline pt-8">
      <h2 className="font-display text-lg font-bold text-paper">License verification API key</h2>
      <p className="mt-1 text-sm text-paper-dim">
        Issue this tool a key so its backend can call{" "}
        <code className="text-xs">POST /api/license/verify</code> to check a subscriber&apos;s
        license without direct database access.
      </p>

      {revealedKey && (
        <div className="mt-4 border border-gold bg-ink-raised px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-bright">
            Copy this now — it won&apos;t be shown again
          </p>
          <p className="mt-1 select-all break-all font-mono text-sm text-paper">{revealedKey}</p>
        </div>
      )}

      {keys.length > 0 && (
        <ul className="mt-4 border-t border-hairline">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-4 border-b border-hairline py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-paper">{k.keyPrefix}…</p>
                <p className="text-xs text-paper-dim">
                  {k.active ? "Active" : "Revoked"} · created {k.createdAt.toLocaleDateString()}
                  {k.lastUsedAt ? ` · last used ${k.lastUsedAt.toLocaleDateString()}` : ""}
                </p>
              </div>
              {k.active && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRevoke(k.id)}
                  className="shrink-0 text-sm text-red-400 hover:text-red-300"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button type="button" disabled={pending} onClick={handleCreate} className="mt-4">
        {pending ? "Working…" : "Generate new key"}
      </Button>
    </div>
  );
}
