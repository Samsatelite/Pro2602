import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GridNewsItem {
  id: string;
  title: string;
  description: string | null;
  type: "alert" | "info" | "update" | null;
  region: string | null;
  created_at: string;
}

const NEWS_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useGridNews() {
  const [news, setNews] = useState<GridNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(async () => {
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
  }, []);

  const fetchFromNERC = useCallback(async () => {
    try {
      console.log("Fetching news from NERC...");
      const { data, error } = await supabase.functions.invoke('fetch-nerc-news');
      
      if (error) {
        console.error("Error fetching NERC news:", error);
        return;
      }
      
      if (data?.success) {
        console.log("NERC news fetched successfully");
        await fetchNews();
      }
    } catch (error) {
      console.error("Error in NERC fetch:", error);
    }
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();

    // Set up auto-refresh for NERC news
    intervalRef.current = setInterval(() => {
      fetchFromNERC();
    }, NEWS_REFRESH_INTERVAL);

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [fetchNews, fetchFromNERC]);

  return { news, loading, refetchNews: fetchNews, fetchFromNERC };
}
