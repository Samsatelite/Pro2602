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

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
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
        <GridHealthIndicator status="stable" lastUpdated="12:45:32 PM" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GridStatusCard
            title="Generation"
            value="4,128"
            unit="MW"
            icon={Zap}
            status="stable"
            trend="up"
            trendValue="+142 MW"
            delay={0}
          />
          <GridStatusCard
            title="Frequency"
            value="50.02"
            unit="Hz"
            icon={Activity}
            status="stable"
            trend="neutral"
            trendValue="0.01 Hz"
            delay={100}
          />
          <GridStatusCard
            title="Grid Load"
            value="78"
            unit="%"
            icon={Gauge}
            status="stressed"
            trend="up"
            trendValue="+3%"
            delay={200}
          />
          <GridStatusCard
            title="Active Reports"
            value="1,847"
            icon={BarChart3}
            status="stable"
            trend="up"
            trendValue="+124"
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <NigeriaMap />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecentReports />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <DiscoBreakdown />
          <GridNews />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Data aggregated from TCN, NBET, and community reports. Last sync: 2 min ago
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
