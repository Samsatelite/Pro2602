import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface StateStatus {
  available: number;
  unavailable: number;
}

interface NigeriaMapCanvasProps {
  reportsByState: Record<string, StateStatus>;
  onStateClick?: (stateName: string) => void;
}

// Nigeria TopoJSON URL
const NIGERIA_TOPO_JSON = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/nigeria/nigeria-states.json";

// State center coordinates for markers
const stateMarkers: Record<string, { lat: number; lng: number }> = {
  "Abia": { lat: 5.45, lng: 7.52 },
  "Adamawa": { lat: 9.33, lng: 12.40 },
  "Akwa Ibom": { lat: 5.01, lng: 7.93 },
  "Anambra": { lat: 6.22, lng: 6.94 },
  "Bauchi": { lat: 10.31, lng: 9.84 },
  "Bayelsa": { lat: 4.77, lng: 6.07 },
  "Benue": { lat: 7.34, lng: 8.77 },
  "Borno": { lat: 11.89, lng: 13.15 },
  "Cross River": { lat: 5.87, lng: 8.60 },
  "Delta": { lat: 5.53, lng: 5.90 },
  "Ebonyi": { lat: 6.26, lng: 8.09 },
  "Edo": { lat: 6.63, lng: 5.93 },
  "Ekiti": { lat: 7.72, lng: 5.31 },
  "Enugu": { lat: 6.54, lng: 7.49 },
  "FCT": { lat: 9.06, lng: 7.49 },
  "Federal Capital Territory": { lat: 9.06, lng: 7.49 },
  "Gombe": { lat: 10.29, lng: 11.17 },
  "Imo": { lat: 5.57, lng: 7.06 },
  "Jigawa": { lat: 12.23, lng: 9.56 },
  "Kaduna": { lat: 10.52, lng: 7.44 },
  "Kano": { lat: 12.00, lng: 8.52 },
  "Katsina": { lat: 12.99, lng: 7.60 },
  "Kebbi": { lat: 12.45, lng: 4.20 },
  "Kogi": { lat: 7.73, lng: 6.69 },
  "Kwara": { lat: 8.97, lng: 4.39 },
  "Lagos": { lat: 6.52, lng: 3.38 },
  "Nasarawa": { lat: 8.54, lng: 8.11 },
  "Niger": { lat: 9.93, lng: 5.60 },
  "Ogun": { lat: 7.00, lng: 3.47 },
  "Ondo": { lat: 7.10, lng: 4.84 },
  "Osun": { lat: 7.56, lng: 4.52 },
  "Oyo": { lat: 8.12, lng: 3.42 },
  "Plateau": { lat: 9.22, lng: 9.52 },
  "Rivers": { lat: 4.84, lng: 6.86 },
  "Sokoto": { lat: 13.06, lng: 5.24 },
  "Taraba": { lat: 7.87, lng: 10.77 },
  "Yobe": { lat: 12.29, lng: 11.44 },
  "Zamfara": { lat: 12.17, lng: 6.25 },
};

export function NigeriaMapCanvas({ reportsByState, onStateClick }: NigeriaMapCanvasProps) {
  const [position, setPosition] = useState({ coordinates: [8.5, 9.0] as [number, number], zoom: 1 });
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleZoomIn = () => {
    if (position.zoom < 4) {
      setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    }
  };

  const handleZoomOut = () => {
    if (position.zoom > 0.5) {
      setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    }
  };

  const handleReset = () => {
    setPosition({ coordinates: [8.5, 9.0], zoom: 1 });
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  // Get status for a state
  const getStateStatus = (stateName: string): "available" | "unavailable" | "none" => {
    // Normalize state name
    const normalizedName = stateName.replace("State", "").trim();
    const stateReports = reportsByState[normalizedName] || reportsByState[stateName];
    if (!stateReports) return "none";
    const total = stateReports.available + stateReports.unavailable;
    if (total === 0) return "none";
    return stateReports.available >= stateReports.unavailable ? "available" : "unavailable";
  };

  // Generate markers for states with reports
  const markers = useMemo(() => {
    const result: Array<{ name: string; coordinates: [number, number]; status: "available" | "unavailable" }> = [];
    
    Object.keys(reportsByState).forEach((stateName) => {
      const coords = stateMarkers[stateName];
      if (coords) {
        const status = getStateStatus(stateName);
        if (status !== "none") {
          result.push({
            name: stateName,
            coordinates: [coords.lng, coords.lat],
            status,
          });
        }
      }
    });
    
    return result;
  }, [reportsByState]);

  return (
    <div className="relative w-full aspect-[4/3]">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur-sm"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur-sm"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur-sm"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Hovered State Label */}
      {hoveredState && (
        <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border">
          <span className="text-sm font-medium">{hoveredState}</span>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2800,
          center: [8.5, 9.0],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.5}
          maxZoom={4}
        >
          <Geographies geography={NIGERIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.admin1Name || geo.properties.NAME_1 || geo.properties.name;
                const status = getStateStatus(stateName);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onStateClick?.(stateName.replace(" State", "").trim())}
                    style={{
                      default: {
                        fill: status === "available" 
                          ? "hsl(var(--success) / 0.3)" 
                          : status === "unavailable" 
                            ? "hsl(var(--critical) / 0.3)" 
                            : "hsl(var(--muted))",
                        stroke: "hsl(var(--border))",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      hover: {
                        fill: status === "available" 
                          ? "hsl(var(--success) / 0.5)" 
                          : status === "unavailable" 
                            ? "hsl(var(--critical) / 0.5)" 
                            : "hsl(var(--muted) / 0.8)",
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "hsl(var(--primary) / 0.5)",
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Status Markers */}
          {markers.map(({ name, coordinates, status }) => (
            <Marker key={name} coordinates={coordinates}>
              {/* Outer glow */}
              <circle
                r={8 / position.zoom}
                fill={status === "available" ? "hsl(var(--success) / 0.4)" : "hsl(var(--critical) / 0.4)"}
              />
              {/* Main dot */}
              <circle
                r={5 / position.zoom}
                fill={status === "available" ? "hsl(var(--success))" : "hsl(var(--critical))"}
                stroke="hsl(var(--background))"
                strokeWidth={1.5 / position.zoom}
              />
              {/* Pulse animation for outages */}
              {status === "unavailable" && (
                <circle
                  r={5 / position.zoom}
                  fill="none"
                  stroke="hsl(var(--critical))"
                  strokeWidth={1.5 / position.zoom}
                  className="animate-ping"
                  style={{ animationDuration: "2s" }}
                />
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}