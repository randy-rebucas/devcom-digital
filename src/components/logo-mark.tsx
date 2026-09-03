type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Devcom Digital"
    >
      <rect x="4" y="4" width="92" height="92" rx="18" fill="var(--gold)" />
      <circle cx="50" cy="40" r="12" fill="var(--ink)" />
      <polygon points="44,48 56,48 64,78 36,78" fill="var(--ink)" />
    </svg>
  );
}
