import type { ComponentPropsWithoutRef, ReactNode } from "react";

const fieldStyles =
  "mt-1.5 w-full rounded-sm border border-hairline bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper-dim/60 transition-colors focus-visible:border-gold-bright";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide text-paper-dim"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-paper-dim">{hint}</p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input className={[fieldStyles, className].filter(Boolean).join(" ")} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={[fieldStyles, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function Select({
  className,
  containerClassName,
  children,
  ...props
}: ComponentPropsWithoutRef<"select"> & { containerClassName?: string }) {
  return (
    <div className={["relative mt-1.5", containerClassName].filter(Boolean).join(" ")}>
      <select
        className={[
          fieldStyles,
          "mt-0 appearance-none pr-9",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.417a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
