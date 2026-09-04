"use client";

import type { ReactNode } from "react";

/**
 * Best-effort deterrent against casual copy/select/right-click. Not real
 * security — the value is still in the page source — just discourages
 * screenshotting/copy-pasting the quoted price out of context.
 */
export function ProtectedText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={["select-none", className].filter(Boolean).join(" ")}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </span>
  );
}
