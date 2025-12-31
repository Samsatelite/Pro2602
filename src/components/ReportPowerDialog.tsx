import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap, ZapOff, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RadarAutocomplete } from "./RadarAutocomplete";
import { usePowerReports } from "@/hooks/usePowerReports";

interface ReportPowerDialogProps {
  children: React.ReactNode;
}

interface SelectedLocation {
  address: string;
  region: string;
  latitude: number;
  longitude: number;
}

export function ReportPowerDialog({ children }: ReportPowerDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"available" | "unavailable" | null>(null);
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [duration, setDuration] = useState([0]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitReport } = usePowerReports();

  const handleLocationSelect = (address: {
    formattedAddress: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  }) => {
    setLocation({
      address: address.formattedAddress,
      region: `${address.city}, ${address.state}`,
      latitude: address.latitude,
      longitude: address.longitude,
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            region: "Current Location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("Location detected");
        },
        () => {
          toast.error("Could not get your location");
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!status || !location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitReport({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        region: location.region,
        status,
        estimated_duration: duration[0] > 0 
          ? `${duration[0]} hour${duration[0] > 1 ? "s" : ""}` 
          : undefined,
      });

      setSubmitted(true);
      toast.success("Report submitted successfully!", {
        description: "Thank you for contributing to the community",
      });
      
      setTimeout(() => {
        setOpen(false);
        setStatus(null);
        setLocation(null);
        setDuration([0]);
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Report Power Status
              </DialogTitle>
              <DialogDescription>
                Help your community by reporting the current power availability in your area
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Power Status Selection */}
              <div className="space-y-3">
                <Label>Power Status *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStatus("available")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      status === "available"
                        ? "border-success bg-success/10"
                        : "border-border hover:border-success/50 hover:bg-success/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      status === "available" ? "bg-success/20" : "bg-muted"
                    )}>
                      <Zap className={cn(
                        "w-6 h-6",
                        status === "available" ? "text-success" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium",
                      status === "available" && "text-success"
                    )}>
                      Power Available
                    </span>
                  </button>

                  <button
                    onClick={() => setStatus("unavailable")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      status === "unavailable"
                        ? "border-critical bg-critical/10"
                        : "border-border hover:border-critical/50 hover:bg-critical/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      status === "unavailable" ? "bg-critical/20" : "bg-muted"
                    )}>
                      <ZapOff className={cn(
                        "w-6 h-6",
                        status === "unavailable" ? "text-critical" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium",
                      status === "unavailable" && "text-critical"
                    )}>
                      No Power
                    </span>
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-3">
                <Label>Your Location *</Label>
                <div className="flex gap-2">
                  <RadarAutocomplete
                    placeholder="Search your address..."
                    onSelect={handleLocationSelect}
                    value={location?.address}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGetLocation}
                    title="Use my location"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
                {location && (
                  <p className="text-xs text-muted-foreground">
                    📍 {location.region}
                  </p>
                )}
              </div>

              {/* Duration (for both available and unavailable) */}
              {status && (
                <div className="space-y-3 animate-fade-in">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {status === "available" ? "Estimated Availability Duration" : "Estimated Outage Duration"}
                  </Label>
                  <div className="space-y-2">
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={24}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Just now</span>
                      <span className="font-mono text-foreground">
                        {duration[0] === 0 ? "Unknown" : `${duration[0]} hour${duration[0] > 1 ? "s" : ""}`}
                      </span>
                      <span>24+ hours</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full"
                variant="glow"
                disabled={!status || !location || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your report helps thousands of Nigerians plan their day
              </p>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Report Submitted!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you for contributing to the community
              </p>
            </div>
            <Badge variant="success">+5 Reputation Points</Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
