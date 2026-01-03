import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from "date-fns";

type TimeRange = "daily" | "weekly" | "monthly";

interface GridDataPoint {
  created_at: string;
  generation_mw: number | null;
  frequency: number | null;
  load_percent: number | null;
}

interface ChartDataPoint {
  time: string;
  generation: number | null;
  frequency: number | null;
  load: number | null;
}

export function GridTrendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      let startDate: Date;
      const now = new Date();
      
      switch (timeRange) {
        case "daily":
          startDate = subDays(now, 1);
          break;
        case "weekly":
          startDate = subWeeks(now, 1);
          break;
        case "monthly":
          startDate = subMonths(now, 1);
          break;
        default:
          startDate = subDays(now, 1);
      }

      try {
        const { data, error } = await supabase
          .from("grid_data")
          .select("created_at, generation_mw, frequency, load_percent")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching grid trend data:", error);
          return;
        }

        if (data && data.length > 0) {
          const formattedData = data.map((point: GridDataPoint) => {
            let timeFormat: string;
            switch (timeRange) {
              case "daily":
                timeFormat = "HH:mm";
                break;
              case "weekly":
                timeFormat = "EEE HH:mm";
                break;
              case "monthly":
                timeFormat = "MMM dd";
                break;
              default:
                timeFormat = "HH:mm";
            }
            
            return {
              time: format(new Date(point.created_at), timeFormat),
              generation: point.generation_mw,
              frequency: point.frequency,
              load: point.load_percent,
            };
          });
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching grid trend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return (
    <Card className="animate-fade-in border-border" style={{ animationDelay: "400ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Grid Trend
          </CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3 h-6">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3 h-6">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-6">
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="generation" 
                  name="Generation (MW)"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  name="Load (%)"
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
