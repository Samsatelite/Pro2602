import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Minus } from "lucide-react";

interface GridStatusCardProps {
  title: string;
  value?: string | number | null;
  unit?: string;
  icon: LucideIcon;
  status?: "stable" | "stressed" | "critical";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export function GridStatusCard({
  title,
  value,
  unit,
  icon: Icon,
  status = "stable",
  trend,
  trendValue,
  delay = 0,
}: GridStatusCardProps) {
  const statusVariant = {
    stable: "glow" as const,
    stressed: "warning" as const,
    critical: "critical" as const,
  };

  const statusColor = {
    stable: "text-success",
    stressed: "text-warning",
    critical: "text-critical",
  };

  const hasValue = value !== undefined && value !== null;

  return (
    <Card
      variant={statusVariant[status]}
      className={cn(
        "relative overflow-hidden animate-fade-in group hover:scale-[1.02] transition-transform duration-300"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/50 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg bg-secondary/50", hasValue ? statusColor[status] : "text-muted-foreground")}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent>
        {hasValue ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className={cn("stat-value", statusColor[status])}>
                {value}
              </span>
              {unit && (
                <span className="text-lg text-muted-foreground font-mono">
                  {unit}
                </span>
              )}
            </div>
            
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-critical",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
                </span>
                <span className="text-xs text-muted-foreground">vs last hour</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono text-muted-foreground">
              <Minus className="w-8 h-8" />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}