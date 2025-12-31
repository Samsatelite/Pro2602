import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GridData {
  generation: number | null;
  frequency: number | null;
  load: number | null;
  reports: number | null;
  status: "stable" | "stressed" | "critical" | null;
  lastUpdated: string | null;
}

export function useGridData() {
  const [gridData, setGridData] = useState<GridData>({
    generation: null,
    frequency: null,
    load: null,
    reports: null,
    status: null,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchGridData = useCallback(async () => {
    try {
      // Get latest grid data
      const { data: latestGrid } = await supabase
        .from("grid_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get active reports count
      const { count: reportsCount } = await supabase
        .from("power_reports")
        .select("*", { count: "exact", head: true });

      setGridData({
        generation: latestGrid?.generation_mw ?? null,
        frequency: latestGrid?.frequency ?? null,
        load: latestGrid?.load_percent ?? null,
        reports: reportsCount ?? null,
        status: (latestGrid?.status as GridData["status"]) ?? null,
        lastUpdated: latestGrid?.created_at
          ? new Date(latestGrid.created_at).toLocaleTimeString()
          : null,
      });
    } catch (error) {
      console.error("Error fetching grid data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGridData();

    // Subscribe to real-time updates
    const gridChannel = supabase
      .channel("grid-data-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "grid_data",
        },
        (payload) => {
          const newData = payload.new as {
            generation_mw: number | null;
            frequency: number | null;
            load_percent: number | null;
            status: string | null;
            created_at: string;
          };
          setGridData((prev) => ({
            ...prev,
            generation: newData.generation_mw,
            frequency: newData.frequency,
            load: newData.load_percent,
            status: newData.status as GridData["status"],
            lastUpdated: new Date(newData.created_at).toLocaleTimeString(),
          }));
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel("reports-count-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "power_reports",
        },
        async () => {
          const { count } = await supabase
            .from("power_reports")
            .select("*", { count: "exact", head: true });
          setGridData((prev) => ({ ...prev, reports: count ?? prev.reports }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gridChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, [fetchGridData]);

  return { gridData, loading, refetch: fetchGridData };
}
