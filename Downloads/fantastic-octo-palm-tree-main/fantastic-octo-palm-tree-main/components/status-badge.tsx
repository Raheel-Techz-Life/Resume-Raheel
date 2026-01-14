import { cn } from "@/lib/utils"

type Status = "success" | "warning" | "error" | "info" | "default" | "low" | "medium" | "high" | "critical"

interface StatusBadgeProps {
  status: Status
  label?: string
  className?: string
}

const statusStyles: Record<Status, string> = {
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  error: "bg-destructive/20 text-destructive",
  info: "bg-primary/20 text-primary",
  default: "bg-muted text-muted-foreground",
  low: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  high: "bg-orange-500/20 text-orange-500",
  critical: "bg-destructive/20 text-destructive",
}

const statusLabels: Record<Status, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
  default: "Default",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {label || statusLabels[status]}
    </span>
  )
}
