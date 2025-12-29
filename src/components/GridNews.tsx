import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, AlertTriangle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  type: "alert" | "info" | "update";
  timestamp: string;
  region?: string;
}

const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Grid Stabilization Successful",
    description: "TCN reports successful restoration of Shiroro-Kaduna 330kV line after maintenance",
    type: "update",
    timestamp: "30 min ago",
    region: "North Central",
  },
  {
    id: "2",
    title: "Scheduled Maintenance Notice",
    description: "Planned outage in parts of Lekki Phase 1 on Dec 30, 10AM-2PM for infrastructure upgrade",
    type: "info",
    timestamp: "1 hour ago",
    region: "Lagos",
  },
  {
    id: "3",
    title: "Generation Drops Below 4,000MW",
    description: "National grid generation fell to 3,890MW due to gas constraints at Egbin Power Plant",
    type: "alert",
    timestamp: "2 hours ago",
  },
  {
    id: "4",
    title: "New Solar Farm Connected",
    description: "20MW solar facility in Katsina successfully connected to the national grid",
    type: "update",
    timestamp: "4 hours ago",
    region: "North West",
  },
];

export function GridNews() {
  const getTypeConfig = (type: NewsItem["type"]) => {
    switch (type) {
      case "alert":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
        };
      case "info":
        return {
          icon: Info,
          color: "text-primary",
          bg: "bg-primary/10",
          border: "border-primary/30",
        };
      case "update":
        return {
          icon: Zap,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/30",
        };
    }
  };

  return (
    <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "500ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="w-4 h-4 text-primary" />
          Grid News & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-6 pb-6">
          <div className="space-y-3">
            {newsData.map((news, index) => {
              const config = getTypeConfig(news.type);
              const Icon = config.icon;

              return (
                <div
                  key={news.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 hover:bg-secondary/30 animate-slide-in-right cursor-pointer",
                    config.bg,
                    config.border
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 p-1.5 rounded-lg", config.bg)}>
                      <Icon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{news.title}</span>
                        {news.region && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {news.region}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {news.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block">
                        {news.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
