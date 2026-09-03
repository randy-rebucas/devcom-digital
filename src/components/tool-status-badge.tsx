import { StatusIndicator } from "@/components/ui/status-indicator";
import { TOOL_STATUS_LABELS, TOOL_STATUS_LIT, type ToolStatus } from "@/lib/tools";

export function ToolStatusBadge({
  status,
  className,
}: {
  status: ToolStatus;
  className?: string;
}) {
  return (
    <StatusIndicator
      lit={TOOL_STATUS_LIT[status]}
      label={TOOL_STATUS_LABELS[status]}
      className={className}
    />
  );
}
