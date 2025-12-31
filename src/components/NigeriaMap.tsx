import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { PowerReport } from "@/hooks/usePowerReports";
import NigeriaMapSvg from "@/assets/nigeria-map.svg";

interface NigeriaMapProps {
  reports?: PowerReport[];
}

export function NigeriaMap({ reports = [] }: NigeriaMapProps) {
  const availableCount = reports.filter(r => r.status === "available").length;
  const unavailableCount = reports.filter(r => r.status === "unavailable").length;

  return (
    <Card className="animate-fade-in h-full border-border" style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-primary" />
            Power Status Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
              {availableCount} Available
            </Badge>
            <Badge variant="outline" className="text-xs bg-critical/10 text-critical border-critical/30">
              {unavailableCount} Outages
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[1000/812] bg-muted/30 rounded-lg overflow-hidden">
          <img 
            src={NigeriaMapSvg} 
            alt="Map of Nigeria showing power status by state"
            className="w-full h-full object-contain p-4"
          />
          
          {reports.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  {reports.length} community {reports.length === 1 ? 'report' : 'reports'} across Nigeria
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Power Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-critical" />
            <span>Power Outage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
