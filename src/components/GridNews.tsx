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

interface GridNewsProps {
  news?: NewsItem[];
}

export function GridNews({ news = [] }: GridNewsProps) {
  const hasNews = news.length > 0;

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
        {hasNews ? (
          <ScrollArea className="h-[280px] px-6 pb-6">
            <div className="space-y-3">
              {news.map((item, index) => {
                const config = getTypeConfig(item.type);
                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
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
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.region && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {item.region}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1.5 block">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground px-6">
            <Newspaper className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm text-center">No news or alerts</p>
            <p className="text-xs mt-1 text-center">Grid updates will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}