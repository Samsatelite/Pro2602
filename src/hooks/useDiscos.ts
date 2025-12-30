import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Disco {
  id: string;
  name: string;
  short_name: string;
  status: "stable" | "stressed" | "critical" | null;
  load_percent: number | null;
  trend: "up" | "down" | "neutral" | null;
  updated_at: string;
}

export function useDiscos() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscos = async () => {
      try {
        const { data, error } = await supabase
          .from("discos")
          .select("*")
          .order("short_name", { ascending: true });

        if (error) throw error;
        setDiscos((data as Disco[]) || []);
      } catch (error) {
        console.error("Error fetching discos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscos();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("discos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "discos",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setDiscos((prev) =>
              prev.map((d) =>
                d.id === (payload.new as Disco).id ? (payload.new as Disco) : d
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { discos, loading };
}
