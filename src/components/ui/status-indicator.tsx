export function StatusIndicator({
  lit,
  label,
  className,
}: {
  lit: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center gap-2 text-sm", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={`status-dot ${lit ? "status-dot--lit" : "status-dot--dormant"}`} />
      <span className={lit ? "font-medium text-gold-bright" : "text-paper-dim"}>
        {label}
      </span>
    </span>
  );
}
