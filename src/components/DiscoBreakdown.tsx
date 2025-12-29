import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoData {
  name: string;
  shortName: string;
  status: "stable" | "stressed" | "critical";
  load: number;
  trend: "up" | "down" | "neutral";
}

interface DiscoBreakdownProps {
  discos?: DiscoData[];
}

export function DiscoBreakdown({ discos = [] }: DiscoBreakdownProps) {
  const hasData = discos.length > 0;

  return (
    <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-4 h-4 text-primary" />
          Distribution Companies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasData ? (
          discos.map((disco, index) => (
            <div
              key={disco.shortName}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50 animate-slide-in-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{disco.shortName}</span>
                  <Badge
                    variant={
                      disco.status === "stable"
                        ? "success"
                        : disco.status === "stressed"
                        ? "warning"
                        : "critical"
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {disco.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm">{disco.load}%</span>
                  {disco.trend === "up" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-warning" />
                  ) : disco.trend === "down" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-success" />
                  ) : null}
                </div>
              </div>
              <Progress
                value={disco.load}
                className={cn(
                  "h-1.5",
                  disco.status === "stable" && "[&>div]:bg-success",
                  disco.status === "stressed" && "[&>div]:bg-warning",
                  disco.status === "critical" && "[&>div]:bg-critical"
                )}
              />
              <p className="text-xs text-muted-foreground mt-1.5">{disco.name}</p>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Building2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No DISCO data available</p>
            <p className="text-xs mt-1">Distribution company status will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}