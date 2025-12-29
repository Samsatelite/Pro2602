import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, ZapOff, Clock, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  location: string;
  status: "available" | "unavailable";
  timestamp: string;
  upvotes: number;
  downvotes: number;
  user: string;
}

interface RecentReportsProps {
  reports?: Report[];
}

export function RecentReports({ reports = [] }: RecentReportsProps) {
  const hasReports = reports.length > 0;

  return (
    <Card variant="glass" className="animate-fade-in h-full" style={{ animationDelay: "300ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-primary" />
            Recent Reports
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {hasReports ? "Live Feed" : "Waiting"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {hasReports ? (
          <ScrollArea className="h-[360px] px-6 pb-6">
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 hover:bg-secondary/30 animate-slide-in-right",
                    report.status === "available"
                      ? "bg-success/5 border-success/20"
                      : "bg-critical/5 border-critical/20"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 p-1.5 rounded-lg",
                          report.status === "available" ? "bg-success/20" : "bg-critical/20"
                        )}
                      >
                        {report.status === "available" ? (
                          <Zap className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <ZapOff className="w-3.5 h-3.5 text-critical" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{report.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{report.user}</span>
                          <span>•</span>
                          <span>{report.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <ThumbsUp className="w-3 h-3" />
                        {report.upvotes}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <ThumbsDown className="w-3 h-3" />
                        {report.downvotes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[360px] flex flex-col items-center justify-center text-muted-foreground px-6">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm text-center">No reports yet</p>
            <p className="text-xs mt-1 text-center">Community reports will appear here in real-time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}