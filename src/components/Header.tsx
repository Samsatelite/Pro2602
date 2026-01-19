import { Button } from "@/components/ui/button";
import { ReportPowerDialog } from "@/components/ReportPowerDialog";
import { Zap, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Nigeria Grid
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ReportPowerDialog>
            <Button size="default" className="flex px-6 py-3 text-base">
              <Plus className="w-5 h-5 mr-2" />
              Report Power
            </Button>
          </ReportPowerDialog>
        </div>
      </div>
    </header>
  );
}
