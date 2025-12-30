import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, ZapOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadarAutocomplete } from "./RadarAutocomplete";
import { PowerReport } from "@/hooks/usePowerReports";

interface RegionData {
  id: string;
  name: string;
  status: "available" | "unavailable" | "no-data";
  confidence: number;
  lastUpdate: string;
  reportCount: number;
  coordinates?: { lat: number; lng: number };
}

interface NigeriaMapProps {
  reports?: PowerReport[];
}

export function NigeriaMap({ reports = [] }: NigeriaMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  // Aggregate reports by region/area
  const regions = useMemo(() => {
    if (reports.length === 0) return [];

    const regionMap = new Map<string, {
      available: number;
      unavailable: number;
      lastUpdate: string;
      lat: number;
      lng: number;
    }>();

    reports.forEach((report) => {
      const key = report.region || report.address || `${report.latitude.toFixed(2)},${report.longitude.toFixed(2)}`;
      const existing = regionMap.get(key);
      
      if (existing) {
        if (report.status === "available") existing.available++;
        else existing.unavailable++;
        if (new Date(report.created_at) > new Date(existing.lastUpdate)) {
          existing.lastUpdate = report.created_at;
        }
      } else {
        regionMap.set(key, {
          available: report.status === "available" ? 1 : 0,
          unavailable: report.status === "unavailable" ? 1 : 0,
          lastUpdate: report.created_at,
          lat: Number(report.latitude),
          lng: Number(report.longitude),
        });
      }
    });

    return Array.from(regionMap.entries()).map(([name, data]) => ({
      id: name,
      name: name.split(",")[0],
      status: data.available > data.unavailable ? "available" as const : 
              data.unavailable > data.available ? "unavailable" as const : "no-data" as const,
      confidence: Math.round((Math.max(data.available, data.unavailable) / (data.available + data.unavailable)) * 100),
      lastUpdate: formatTimeAgo(data.lastUpdate),
      reportCount: data.available + data.unavailable,
      coordinates: { lat: data.lat, lng: data.lng },
    }));
  }, [reports]);

  const handleLocationSelect = (address: {
    formattedAddress: string;
    placeLabel: string;
    latitude: number;
    longitude: number;
  }) => {
    // Find nearby reports or show as no-data
    const nearby = reports.filter((r) => {
      const dist = Math.sqrt(
        Math.pow(Number(r.latitude) - address.latitude, 2) +
        Math.pow(Number(r.longitude) - address.longitude, 2)
      );
      return dist < 0.1; // Roughly 10km radius
    });

    const available = nearby.filter((r) => r.status === "available").length;
    const unavailable = nearby.filter((r) => r.status === "unavailable").length;

    const newRegion: RegionData = {
      id: `search-${Date.now()}`,
      name: address.placeLabel || address.formattedAddress.split(",")[0],
      status: nearby.length === 0 ? "no-data" : 
              available > unavailable ? "available" : "unavailable",
      confidence: nearby.length === 0 ? 0 : 
                  Math.round((Math.max(available, unavailable) / nearby.length) * 100),
      lastUpdate: nearby.length === 0 ? "No reports" : "Recent",
      reportCount: nearby.length,
      coordinates: { lat: address.latitude, lng: address.longitude },
    };
    setSelectedRegion(newRegion);
  };

  const statusCounts = {
    available: regions.filter((r) => r.status === "available").length,
    unavailable: regions.filter((r) => r.status === "unavailable").length,
    noData: regions.filter((r) => r.status === "no-data").length,
  };

  const hasData = regions.length > 0;

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
          {hasData && (
            <div className="flex gap-2">
              <Badge variant="success" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                {statusCounts.available} Available
              </Badge>
              <Badge variant="critical" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-critical" />
                {statusCounts.unavailable} Outage
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Radar.com Autocomplete Search */}
        <RadarAutocomplete
          placeholder="Search address, city, or place in Nigeria..."
          onSelect={handleLocationSelect}
        />

        {/* Map Visualization */}
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-secondary/30 border border-border/50">
          {/* Grid pattern background */}
          <div className="absolute inset-0 grid-pattern opacity-50" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 gradient-radial" />
          
          {/* Nigeria outline */}
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
            
            {/* Region dots from real reports */}
            {regions.slice(0, 20).map((region, index) => {
              // Map coordinates to SVG viewbox (Nigeria roughly 4-14°N, 3-15°E)
              const x = region.coordinates 
                ? 80 + ((region.coordinates.lng - 3) / 12) * 260 
                : 200;
              const y = region.coordinates 
                ? 250 - ((region.coordinates.lat - 4) / 10) * 200 
                : 150;
              const color = region.status === "available" 
                ? "hsl(var(--success))" 
                : region.status === "unavailable" 
                  ? "hsl(var(--critical))" 
                  : "hsl(var(--muted-foreground))";
              
              return (
                <g key={region.id} className="cursor-pointer" onClick={() => setSelectedRegion(region)}>
                  <circle
                    cx={Math.max(90, Math.min(310, x))}
                    cy={Math.max(60, Math.min(240, y))}
                    r="6"
                    fill={color}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Empty state text */}
            {!hasData && (
              <text
                x="200"
                y="150"
                textAnchor="middle"
                className="text-sm fill-muted-foreground"
              >
                No power reports yet
              </text>
            )}
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
                  {selectedRegion.confidence > 0 && (
                    <span>Confidence: {selectedRegion.confidence}%</span>
                  )}
                  {selectedRegion.reportCount > 0 && (
                    <span>{selectedRegion.reportCount} reports</span>
                  )}
                  <span>Updated: {selectedRegion.lastUpdate}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRegion(null)}>
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Region List - Empty State */}
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No community reports available</p>
            <p className="text-xs mt-1">Be the first to report power status in your area</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {regions.slice(0, 8).map((region) => (
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
                  <span className="font-medium text-sm truncate">{region.name}</span>
                  {region.status === "available" ? (
                    <Zap className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : region.status === "unavailable" ? (
                    <ZapOff className="w-3.5 h-3.5 text-critical shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {region.lastUpdate}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
