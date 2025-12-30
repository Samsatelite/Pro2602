import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PowerReport {
  id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  region: string | null;
  status: "available" | "unavailable";
  estimated_duration: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export function usePowerReports() {
  const [reports, setReports] = useState<PowerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("power_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setReports((data as PowerReport[]) || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("power-reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "power_reports",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setReports((prev) => [payload.new as PowerReport, ...prev].slice(0, 50));
          } else if (payload.eventType === "UPDATE") {
            setReports((prev) =>
              prev.map((r) =>
                r.id === (payload.new as PowerReport).id
                  ? (payload.new as PowerReport)
                  : r
              )
            );
          } else if (payload.eventType === "DELETE") {
            setReports((prev) =>
              prev.filter((r) => r.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitReport = async (report: {
    latitude: number;
    longitude: number;
    address: string;
    region?: string;
    status: "available" | "unavailable";
    estimated_duration?: string;
  }) => {
    const { data, error } = await supabase
      .from("power_reports")
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { reports, loading, submitReport };
}
