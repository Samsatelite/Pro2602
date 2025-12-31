import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RADAR_PUBLISHABLE_KEY = "prj_live_pk_91d45eb8aac0bc201f2c4864abd785748144fdba";

interface RadarAddress {
  formattedAddress: string;
  addressLabel?: string;
  placeLabel?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface RadarAutocompleteProps {
  placeholder?: string;
  onSelect: (address: RadarAddress) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function RadarAutocomplete({
  placeholder = "Search address, city, or place...",
  onSelect,
  className,
  value: externalValue,
  onChange,
}: RadarAutocompleteProps) {
  const [query, setQuery] = useState(externalValue || "");
  const [results, setResults] = useState<RadarAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalValue !== undefined) {
      setQuery(externalValue);
    }
  }, [externalValue]);

  const searchRadar = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(searchQuery)}&country=NG&limit=5`,
        { headers: { Authorization: RADAR_PUBLISHABLE_KEY } }
      );
      const data = await response.json();
      if (data.addresses) {
        setResults(data.addresses);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Radar search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchRadar(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchRadar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (address: RadarAddress) => {
    setQuery(address.formattedAddress);
    setShowResults(false);
    onChange?.(address.formattedAddress);
    onSelect(address);
  };

  const handleUseCustomAddress = () => {
    const customAddress: RadarAddress = {
      formattedAddress: query,
      latitude: 9.082,
      longitude: 8.6753,
      city: query,
      state: "Nigeria",
      country: "Nigeria",
    };
    setShowResults(false);
    onChange?.(query);
    onSelect(customAddress);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => results.length > 0 && setShowResults(true)}
        className="pl-10 bg-muted/50 border-border"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {results.map((address, index) => (
            <button
              key={index}
              onClick={() => handleSelect(address)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{address.placeLabel || address.addressLabel || address.formattedAddress}</p>
                  <p className="text-xs text-muted-foreground truncate">{address.formattedAddress}</p>
                </div>
              </div>
            </button>
          ))}
          {query.length >= 3 && (
            <button
              onClick={handleUseCustomAddress}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-t border-border"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Use "{query}" as custom address</p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
