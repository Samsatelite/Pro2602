import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GridNewsItem {
  id: string;
  title: string;
  description: string | null;
  type: "alert" | "info" | "update" | null;
  region: string | null;
  created_at: string;
}

export function useGridNews() {
  const [news, setNews] = useState<GridNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("grid_news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setNews((data as GridNewsItem[]) || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("grid-news-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "grid_news",
        },
        (payload) => {
          setNews((prev) => [payload.new as GridNewsItem, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { news, loading };
}
