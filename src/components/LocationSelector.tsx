import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStateNames, getLGAsByState } from "@/data/nigeriaLocations";

export interface LocationData {
  state: string;
  lga: string;
  community: string;
}

interface LocationSelectorProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  showLabels?: boolean;
}

export function LocationSelector({ value, onChange, showLabels = true }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState(value?.state || "");
  const [selectedLGA, setSelectedLGA] = useState(value?.lga || "");
  const [community, setCommunity] = useState(value?.community || "");

  const states = getStateNames();
  const lgas = selectedState ? getLGAsByState(selectedState) : [];

  useEffect(() => {
    if (selectedState && selectedLGA && community) {
      onChange({
        state: selectedState,
        lga: selectedLGA,
        community: community,
      });
    }
  }, [selectedState, selectedLGA, community, onChange]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedLGA("");
    setCommunity("");
  };

  const handleLGAChange = (lga: string) => {
    setSelectedLGA(lga);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {showLabels && <Label className="text-xs">State</Label>}
        <Select value={selectedState} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        {showLabels && <Label className="text-xs">Local Government</Label>}
        <Select 
          value={selectedLGA} 
          onValueChange={handleLGAChange}
          disabled={!selectedState}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedState ? "Select LGA" : "Select State first"} />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {lgas.map((lga) => (
              <SelectItem key={lga} value={lga}>
                {lga}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        {showLabels && <Label className="text-xs">Community Name</Label>}
        <Input
          placeholder={selectedLGA ? "Enter your community name" : "Select LGA first"}
          value={community}
          onChange={(e) => setCommunity(e.target.value)}
          disabled={!selectedLGA}
        />
      </div>
    </div>
  );
}
