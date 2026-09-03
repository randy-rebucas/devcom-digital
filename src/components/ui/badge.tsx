import type { ComponentPropsWithoutRef } from "react";

export function Badge({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-sm border border-hairline px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-paper-dim",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
