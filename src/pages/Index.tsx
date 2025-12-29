import { Header } from "@/components/Header";
import { GridStatusCard } from "@/components/GridStatusCard";
import { GridHealthIndicator } from "@/components/GridHealthIndicator";
import { NigeriaMap } from "@/components/NigeriaMap";
import { RecentReports } from "@/components/RecentReports";
import { DiscoBreakdown } from "@/components/DiscoBreakdown";
import { GridNews } from "@/components/GridNews";
import { Zap, Activity, Gauge, BarChart3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const handleShare = () => {
    toast.success("Sharing options coming soon!", {
      description: "Share grid status on WhatsApp, Twitter, and more",
    });
  };

  // Real-time data would come from your backend/database
  // Using empty/null values to show empty states
  const gridData = {
    generation: null as number | null,
    frequency: null as number | null,
    load: null as number | null,
    reports: null as number | null,
    status: null as "stable" | "stressed" | "critical" | null,
    lastUpdated: null as string | null,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <Header />

      <main className="relative container px-4 md:px-6 py-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Grid Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time national grid status and community power reports
            </p>
          </div>
          <Button variant="outline" onClick={handleShare} className="sm:w-auto w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Status
          </Button>
        </div>

        {/* Grid Health Status */}
        <GridHealthIndicator 
          status={gridData.status} 
          lastUpdated={gridData.lastUpdated} 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GridStatusCard
            title="Generation"
            value={gridData.generation}
            unit="MW"
            icon={Zap}
            status="stable"
            delay={0}
          />
          <GridStatusCard
            title="Frequency"
            value={gridData.frequency}
            unit="Hz"
            icon={Activity}
            status="stable"
            delay={100}
          />
          <GridStatusCard
            title="Grid Load"
            value={gridData.load}
            unit="%"
            icon={Gauge}
            status="stable"
            delay={200}
          />
          <GridStatusCard
            title="Active Reports"
            value={gridData.reports}
            icon={BarChart3}
            status="stable"
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <NigeriaMap regions={[]} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecentReports reports={[]} />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <DiscoBreakdown discos={[]} />
          <GridNews news={[]} />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Waiting for data from TCN, NBET, and community reports
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                API
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;