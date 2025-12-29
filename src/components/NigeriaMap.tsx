import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Zap, ZapOff, Info, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionData {
  id: string;
  name: string;
  status: "available" | "unavailable" | "no-data";
  confidence: number;
  lastUpdate: string;
  reportCount: number;
  coordinates?: { lat: number; lng: number };
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface NigeriaMapProps {
  regions?: RegionData[];
}

const MAPBOX_TOKEN_KEY = "mapbox_public_token";

export function NigeriaMap({ regions = [] }: NigeriaMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem(MAPBOX_TOKEN_KEY) || ""
  );
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [tempToken, setTempToken] = useState("");

  const saveToken = () => {
    if (tempToken.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tempToken.trim());
      setMapboxToken(tempToken.trim());
      setShowTokenInput(false);
    }
  };

  const searchMapbox = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxToken) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=NG&access_token=${mapboxToken}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (error) {
      console.error("Mapbox search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [mapboxToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMapbox(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMapbox]);

  const handleSelectSearchResult = (feature: MapboxFeature) => {
    const newRegion: RegionData = {
      id: feature.id,
      name: feature.place_name.split(",")[0],
      status: "no-data",
      confidence: 0,
      lastUpdate: "No reports",
      reportCount: 0,
      coordinates: { lat: feature.center[1], lng: feature.center[0] },
    };
    setSelectedRegion(newRegion);
    setSearchQuery(feature.place_name.split(",")[0]);
    setSearchResults([]);
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
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                {statusCounts.noData} No Data
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mapbox Token Setup */}
        {showTokenInput && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Enter your Mapbox public token for address search</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="pk.eyJ1..."
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
              <Button onClick={saveToken} disabled={!tempToken.trim()}>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free token at{" "}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={mapboxToken ? "Search address, city, or place..." : "Enter Mapbox token to enable search"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
            disabled={!mapboxToken}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
          {!showTokenInput && mapboxToken && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs"
              onClick={() => setShowTokenInput(true)}
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full max-w-[calc(100%-3rem)] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleSelectSearchResult(feature)}
                className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{feature.place_name.split(",")[0]}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {feature.place_name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

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
            
            {/* Region dots */}
            {regions.map((region, index) => {
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
        )}
      </CardContent>
    </Card>
  );
}