import { StatusIndicator } from "@/components/ui/status-indicator";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_LIT, type ProjectStatus } from "@/lib/projects";

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <StatusIndicator
      lit={PROJECT_STATUS_LIT[status]}
      label={PROJECT_STATUS_LABELS[status]}
      className={className}
    />
  );
}
