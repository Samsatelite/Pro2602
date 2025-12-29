import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, ZapOff, Clock, MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
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

const reportsData: Report[] = [
  { id: "1", location: "Victoria Island, Lagos", status: "available", timestamp: "2 min ago", upvotes: 12, downvotes: 1, user: "Anonymous" },
  { id: "2", location: "Garki, Abuja", status: "available", timestamp: "5 min ago", upvotes: 8, downvotes: 0, user: "ChiAdmin" },
  { id: "3", location: "Sabon Gari, Kano", status: "unavailable", timestamp: "8 min ago", upvotes: 15, downvotes: 2, user: "NorthPower" },
  { id: "4", location: "GRA, Port Harcourt", status: "available", timestamp: "12 min ago", upvotes: 6, downvotes: 0, user: "RiversWatch" },
  { id: "5", location: "Ring Road, Ibadan", status: "unavailable", timestamp: "15 min ago", upvotes: 9, downvotes: 1, user: "OyoReporter" },
  { id: "6", location: "Wuse 2, Abuja", status: "available", timestamp: "20 min ago", upvotes: 11, downvotes: 0, user: "AbujaGrid" },
];

export function RecentReports() {
  return (
    <Card variant="glass" className="animate-fade-in h-full" style={{ animationDelay: "300ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-primary" />
            Recent Reports
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Live Feed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[360px] px-6 pb-6">
          <div className="space-y-3">
            {reportsData.map((report, index) => (
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
      </CardContent>
    </Card>
  );
}
