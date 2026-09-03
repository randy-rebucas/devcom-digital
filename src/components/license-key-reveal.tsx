"use client";

import { useState } from "react";

export function LicenseKeyReveal({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = licenseKey.replace(/[A-Z0-9](?=.{4})/g, "•");

  return (
    <div className="mt-3 flex items-center gap-2 border border-hairline bg-ink-raised px-3 py-2">
      <p className="select-all font-mono text-sm tabular-nums text-gold-bright">
        {revealed ? licenseKey : masked}
      </p>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="ml-auto shrink-0 text-xs font-semibold uppercase tracking-wide text-paper-dim hover:text-gold-bright"
      >
        {revealed ? "Hide" : "Reveal"}
      </button>
    </div>
  );
}
