import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X } from "lucide-react";
import { PowerReport } from "@/hooks/usePowerReports";
import { LocationSelector, LocationData } from "./LocationSelector";
import NigeriaMapSvg from "@/assets/nigeria-map.svg";
import { formatDistanceToNow } from "date-fns";
import { stateCoordinates, getStateCoordinate } from "@/data/stateCoordinates";

interface NigeriaMapProps {
  reports?: PowerReport[];
}

export function NigeriaMap({ reports = [] }: NigeriaMapProps) {
  const [searchLocation, setSearchLocation] = useState<LocationData | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleSearchChange = useCallback((location: LocationData) => {
    setSearchLocation(location);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchLocation(null);
    setResetKey(prev => prev + 1);
  }, []);

  const filteredReports = useMemo(() => {
    if (!searchLocation?.state && !searchLocation?.lga && !searchLocation?.community) {
      return reports;
    }

    return reports.filter((report) => {
      const reportAddress = (report.address || "").toLowerCase();
      const reportRegion = (report.region || "").toLowerCase();
      const combined = `${reportAddress} ${reportRegion}`;

      // Match state first
      if (searchLocation.state) {
        const stateMatch = combined.includes(searchLocation.state.toLowerCase());
        if (!stateMatch) return false;
      }

      // Then match LGA
      if (searchLocation.lga) {
        const lgaMatch = combined.includes(searchLocation.lga.toLowerCase());
        if (!lgaMatch) return false;
      }

      // Then match partial community name
      if (searchLocation.community) {
        const communityLower = searchLocation.community.toLowerCase();
        const communityMatch = combined.includes(communityLower);
        if (!communityMatch) return false;
      }

      return true;
    });
  }, [reports, searchLocation]);

  // Group reports by state to show dots on the map
  const reportsByState = useMemo(() => {
    const stateMap: Record<string, { available: number; unavailable: number }> = {};
    
    reports.forEach((report) => {
      const region = report.region || report.address || "";
      
      // Try to extract state from region
      stateCoordinates.forEach((state) => {
        if (region.toLowerCase().includes(state.name.toLowerCase())) {
          if (!stateMap[state.name]) {
            stateMap[state.name] = { available: 0, unavailable: 0 };
          }
          if (report.status === "available") {
            stateMap[state.name].available++;
          } else {
            stateMap[state.name].unavailable++;
          }
        }
      });
    });
    
    return stateMap;
  }, [reports]);

  // Generate status dots for the map
  const statusDots = useMemo(() => {
    return stateCoordinates
      .map((state) => {
        const stateReports = reportsByState[state.name];
        if (!stateReports) return null;
        
        const total = stateReports.available + stateReports.unavailable;
        if (total === 0) return null;
        
        // Determine predominant status
        const status = stateReports.available >= stateReports.unavailable ? "available" : "unavailable";
        
        return {
          ...state,
          status,
          count: total,
        };
      })
      .filter(Boolean);
  }, [reportsByState]);

  const availableCount = filteredReports.filter(r => r.status === "available").length;
  const unavailableCount = filteredReports.filter(r => r.status === "unavailable").length;

  const isSearchActive = searchLocation?.state || searchLocation?.lga || searchLocation?.community;

  return (
    <Card className="animate-fade-in h-full border-border" style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
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
      <CardContent className="space-y-4">
        {/* Search Section */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Search Community Reports</span>
            </div>
            {isSearchActive && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearSearch}
                className="h-7 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <LocationSelector 
            key={resetKey}
            onChange={handleSearchChange}
            showLabels={false}
          />
        </div>

        {/* Map with Status Dots */}
        <div className="relative w-full aspect-[1000/812] bg-muted/30 rounded-lg overflow-hidden">
          <img 
            src={NigeriaMapSvg} 
            alt="Map of Nigeria showing power status by state"
            className="w-full h-full object-contain p-4"
          />
          
          {/* Status dots overlay */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 812"
            preserveAspectRatio="xMidYMid meet"
          >
            {statusDots.map((dot) => dot && (
              <g key={dot.name}>
                {/* Outer glow */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={12}
                  className={`${dot.status === "available" ? "fill-success/30" : "fill-critical/30"}`}
                />
                {/* Main dot */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={8}
                  className={`${dot.status === "available" ? "fill-success" : "fill-critical"} stroke-background stroke-2`}
                />
                {/* Pulse animation for unavailable */}
                {dot.status === "unavailable" && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={8}
                    className="fill-none stroke-critical stroke-2 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                )}
              </g>
            ))}
          </svg>
          
          {filteredReports.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  {isSearchActive 
                    ? `${filteredReports.length} report${filteredReports.length !== 1 ? 's' : ''} found for ${searchLocation?.community || searchLocation?.lga || searchLocation?.state}`
                    : `${filteredReports.length} community ${filteredReports.length === 1 ? 'report' : 'reports'} across Nigeria`
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filtered Reports List */}
        {isSearchActive && filteredReports.length > 0 && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground">Reports in this area:</p>
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{report.region || report.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge 
                  variant={report.status === "available" ? "success" : "destructive"}
                  className="ml-2 shrink-0"
                >
                  {report.status === "available" ? "Power On" : "No Power"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {isSearchActive && filteredReports.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No reports found for this location</p>
            <p className="text-xs mt-1">Be the first to report!</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
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
