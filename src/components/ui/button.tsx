import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const VARIANTS = {
  primary: "bg-gold text-ink hover:bg-gold-bright disabled:hover:bg-gold",
  secondary:
    "border border-hairline text-paper hover:border-gold hover:text-gold-bright",
  ghost: "text-paper-dim hover:text-paper",
  danger: "text-red-400 hover:text-red-300",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50";

function classes(variant: Variant, size: Size, className?: string) {
  return [base, VARIANTS[variant], SIZES[size], className]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={classes(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variant, size, className)} {...props} />;
}
