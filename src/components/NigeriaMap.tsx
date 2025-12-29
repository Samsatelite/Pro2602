import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Zap, ZapOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionData {
  id: string;
  name: string;
  status: "available" | "unavailable" | "no-data";
  confidence: number;
  lastUpdate: string;
  reportCount: number;
}

const regionsData: RegionData[] = [
  { id: "lagos", name: "Lagos", status: "available", confidence: 92, lastUpdate: "2 min ago", reportCount: 234 },
  { id: "abuja", name: "Abuja FCT", status: "available", confidence: 88, lastUpdate: "5 min ago", reportCount: 156 },
  { id: "kano", name: "Kano", status: "unavailable", confidence: 85, lastUpdate: "3 min ago", reportCount: 89 },
  { id: "rivers", name: "Rivers", status: "available", confidence: 76, lastUpdate: "8 min ago", reportCount: 67 },
  { id: "oyo", name: "Oyo", status: "unavailable", confidence: 82, lastUpdate: "4 min ago", reportCount: 112 },
  { id: "kaduna", name: "Kaduna", status: "available", confidence: 71, lastUpdate: "12 min ago", reportCount: 45 },
  { id: "enugu", name: "Enugu", status: "no-data", confidence: 0, lastUpdate: "1 hour ago", reportCount: 12 },
  { id: "delta", name: "Delta", status: "available", confidence: 68, lastUpdate: "6 min ago", reportCount: 78 },
];

export function NigeriaMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  const filteredRegions = regionsData.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    available: regionsData.filter((r) => r.status === "available").length,
    unavailable: regionsData.filter((r) => r.status === "unavailable").length,
    noData: regionsData.filter((r) => r.status === "no-data").length,
  };

  return (
    <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Community Energy Map
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Crowdsourced power availability across Nigeria
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="success" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              {statusCounts.available} Available
            </Badge>
            <Badge variant="critical" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-critical" />
              {statusCounts.unavailable} Outage
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              {statusCounts.noData} No Data
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search city, state, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>

        {/* Map Visualization */}
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-secondary/30 border border-border/50">
          {/* Grid pattern background */}
          <div className="absolute inset-0 grid-pattern opacity-50" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 gradient-radial" />
          
          {/* Nigeria outline placeholder */}
          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Simplified Nigeria shape */}
            <path
              d="M180 50 L280 60 L320 100 L340 150 L320 200 L280 240 L220 250 L160 240 L100 200 L80 150 L90 100 L130 60 Z"
              fill="hsl(var(--muted) / 0.3)"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            
            {/* Region dots */}
            {filteredRegions.map((region, index) => {
              const positions: Record<string, { x: number; y: number }> = {
                lagos: { x: 120, y: 220 },
                abuja: { x: 200, y: 150 },
                kano: { x: 220, y: 70 },
                rivers: { x: 160, y: 240 },
                oyo: { x: 140, y: 180 },
                kaduna: { x: 200, y: 100 },
                enugu: { x: 200, y: 200 },
                delta: { x: 140, y: 230 },
              };
              
              const pos = positions[region.id] || { x: 200, y: 150 };
              const color = region.status === "available" 
                ? "hsl(var(--success))" 
                : region.status === "unavailable" 
                  ? "hsl(var(--critical))" 
                  : "hsl(var(--muted-foreground))";
              
              return (
                <g key={region.id} className="cursor-pointer" onClick={() => setSelectedRegion(region)}>
                  {/* Pulse animation for active regions */}
                  {region.status !== "no-data" && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="15"
                      fill={color}
                      opacity="0.3"
                      className="animate-ping"
                      style={{ animationDuration: "2s", animationDelay: `${index * 200}ms` }}
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill={color}
                    className="transition-all duration-200 hover:r-10"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 22}
                    textAnchor="middle"
                    className="text-[10px] fill-foreground font-medium"
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-success" />
              Power On
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-critical" />
              Outage
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              No Data
            </span>
          </div>
        </div>

        {/* Selected Region Info */}
        {selectedRegion && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{selectedRegion.name}</h4>
                  {selectedRegion.status === "available" ? (
                    <Badge variant="success" className="gap-1">
                      <Zap className="w-3 h-3" />
                      Power Available
                    </Badge>
                  ) : selectedRegion.status === "unavailable" ? (
                    <Badge variant="critical" className="gap-1">
                      <ZapOff className="w-3 h-3" />
                      Outage
                    </Badge>
                  ) : (
                    <Badge variant="outline">No Recent Data</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Confidence: {selectedRegion.confidence}%</span>
                  <span>{selectedRegion.reportCount} reports</span>
                  <span>Updated: {selectedRegion.lastUpdate}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRegion(null)}>
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Region List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {filteredRegions.slice(0, 8).map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-left hover:scale-[1.02]",
                region.status === "available" && "bg-success/5 border-success/30 hover:bg-success/10",
                region.status === "unavailable" && "bg-critical/5 border-critical/30 hover:bg-critical/10",
                region.status === "no-data" && "bg-muted/30 border-border/50 hover:bg-muted/50",
                selectedRegion?.id === region.id && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{region.name}</span>
                {region.status === "available" ? (
                  <Zap className="w-3.5 h-3.5 text-success" />
                ) : region.status === "unavailable" ? (
                  <ZapOff className="w-3.5 h-3.5 text-critical" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {region.lastUpdate}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
