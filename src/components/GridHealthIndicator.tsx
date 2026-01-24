import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, XCircle, CheckCircle, HelpCircle } from "lucide-react";

interface GridHealthIndicatorProps {
  status?: "stable" | "stressed" | "critical" | "collapse" | null;
  generation?: number | null;
  lastUpdated?: string | null;
}

export function GridHealthIndicator({ status, generation, lastUpdated }: GridHealthIndicatorProps) {
  // Determine if grid has collapsed (generation is 0 or null when we have data)
  const isCollapse = generation !== undefined && generation !== null && generation === 0;
  
  const effectiveStatus = isCollapse ? "collapse" : status;
  const hasStatus = effectiveStatus !== undefined && effectiveStatus !== null;

  const statusConfig = {
    stable: {
      label: "Grid Stable",
      description: "National grid is operating within normal parameters",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      pulseColor: "bg-success",
    },
    stressed: {
      label: "Grid Stressed",
      description: "Elevated load detected, potential instability",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      pulseColor: "bg-warning",
    },
    critical: {
      label: "Grid Critical",
      description: "Severe instability, outages possible",
      icon: XCircle,
      color: "text-critical",
      bgColor: "bg-critical/10",
      borderColor: "border-critical/30",
      pulseColor: "bg-critical",
    },
    collapse: {
      label: "Grid Collapse",
      description: "National grid has collapsed, total system failure",
      icon: XCircle,
      color: "text-critical",
      bgColor: "bg-critical/10",
      borderColor: "border-critical/30",
      pulseColor: "bg-critical",
    },
    unknown: {
      label: "Status Unknown",
      description: "Waiting for grid data...",
      icon: HelpCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      borderColor: "border-border",
      pulseColor: "bg-muted-foreground",
    },
  };

  const config = hasStatus ? statusConfig[effectiveStatus] : statusConfig.unknown;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm animate-fade-in",
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Status indicator */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "absolute w-10 h-10 rounded-full opacity-10",
            config.pulseColor
          )}
        />
        <div
          className={cn(
            "relative w-12 h-12 rounded-full flex items-center justify-center",
            config.bgColor
          )}
        >
          <Icon className={cn("w-6 h-6", config.color)} />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold", config.color)}>{config.label}</h3>
          {hasStatus && (
            <Badge variant={effectiveStatus === "stable" ? "stable" : effectiveStatus === "stressed" ? "warning" : "critical"}>
              LIVE
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {config.description}
        </p>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-xs">Last updated</span>
        </div>
        <p className="text-sm font-mono text-foreground">
          {lastUpdated || "—"}
        </p>
      </div>
    </div>
  );
}