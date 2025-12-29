import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportPowerDialog } from "@/components/ReportPowerDialog";
import { Zap, Menu, Bell, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-gradient-primary">Nigeria</span>
              <span className="text-foreground"> Grid</span>
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              Energy Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-foreground">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Map
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            History
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Analytics
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ReportPowerDialog>
            <Button variant="glow" size="sm" className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-1" />
              Report Power
            </Button>
          </ReportPowerDialog>
          
          <ReportPowerDialog>
            <Button variant="glow" size="icon" className="sm:hidden">
              <Plus className="w-4 h-4" />
            </Button>
          </ReportPowerDialog>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <Button variant="outline" size="icon" className="hidden sm:flex">
            <User className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
