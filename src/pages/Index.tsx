import { useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { GridStatusCard } from "@/components/GridStatusCard";
import { GridHealthIndicator } from "@/components/GridHealthIndicator";
import { RecentReports } from "@/components/RecentReports";
import { GridTrendChart } from "@/components/GridTrendChart";
import { Zap, Activity, Gauge, BarChart3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGridData } from "@/hooks/useGridData";
import { usePowerReports } from "@/hooks/usePowerReports";
import { supabase } from "@/integrations/supabase/client";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const Index = () => {
  const { gridData, loading: gridLoading, refetch: refetchGrid } = useGridData();
  const { reports, loading: reportsLoading } = usePowerReports();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [gridResult, newsResult] = await Promise.all([
        supabase.functions.invoke('fetch-grid-data'),
        supabase.functions.invoke('fetch-nerc-news')
      ]);
      
      if (gridResult.data?.success) {
        refetchGrid();
      }
    } catch (error) {
      console.error("Auto-refresh error:", error);
    }
  }, [refetchGrid]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    refreshData(); // Initial fetch
    
    intervalRef.current = setInterval(refreshData, AUTO_REFRESH_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshData]);

  const handleShare = () => {
    toast.success("Sharing options coming soon!", {
      description: "Share grid status on WhatsApp, Twitter, and more",
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
          <Button variant="outline" onClick={handleShare} className="sm:w-auto">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
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
            status={gridData.status || "stable"}
            delay={0}
          />
          <GridStatusCard
            title="Frequency"
            value={gridData.frequency}
            unit="Hz"
            icon={Activity}
            status={gridData.status || "stable"}
            delay={100}
          />
          <GridStatusCard
            title="Grid Load"
            value={gridData.load}
            unit="%"
            icon={Gauge}
            status={gridData.status || "stable"}
            delay={200}
          />
          <GridStatusCard
            title="Active Reports"
            value={reports.length.toString()}
            icon={BarChart3}
            status="stable"
            delay={300}
          />
        </div>

        {/* Recent Reports */}
        <RecentReports reports={reports} loading={reportsLoading} />

        {/* Chart Section */}
        <GridTrendChart />

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              {reports.length > 0 
                ? `${reports.length} community reports • Data from power.gov.ng`
                : "Waiting for data from power.gov.ng and community reports"
              }
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
